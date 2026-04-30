const DEFAULT_RATE = 5.17;
let editIndex = null;
let lastSnapshot = null; // For "Clear All"
let deletedTaskSnapshot = null; // For single entry undo

let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceData_v1.4')) || {
    name: '', num: '', client: '', contact: '', rate: DEFAULT_RATE, tasks: []
};

window.onload = () => {
    document.getElementById('userName').value = invoiceData.name || '';
    document.getElementById('invoiceNum').value = invoiceData.num || '';
    document.getElementById('clientName').value = invoiceData.client || '';
    document.getElementById('contactInfo').value = invoiceData.contact || '';
    document.getElementById('hourlyRate').value = invoiceData.rate || DEFAULT_RATE;
    document.getElementById('taskDate').valueAsDate = new Date();
    document.getElementById('issueDate').innerText = new Date().toLocaleDateString();
    render();
};

function updateMeta() {
    invoiceData.name = document.getElementById('userName').value;
    invoiceData.num = document.getElementById('invoiceNum').value;
    invoiceData.client = document.getElementById('clientName').value;
    invoiceData.contact = document.getElementById('contactInfo').value;
    invoiceData.rate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    save();
    render();
}

function addTask() {
    const date = document.getElementById('taskDate').value;
    const mainTask = document.getElementById('taskMain').value;
    const comments = document.getElementById('taskComments').value;
    const duration = parseFloat(document.getElementById('taskDuration').value);

    if (!date || !mainTask || isNaN(duration)) {
        alert("Please fill in Date, Main Task, and Hours.");
        return;
    }

    const entry = { date, mainTask, comments, duration };

    if (editIndex !== null) {
        invoiceData.tasks[editIndex] = entry;
        editIndex = null;
        document.querySelector('.btn-add').innerText = "Add to Invoice";
        document.getElementById('btn-cancel').style.display = "none";
    } else {
        invoiceData.tasks.push(entry);
    }

    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    resetForm();
    render();
}

function resetForm() {
    document.getElementById('taskMain').value = '';
    document.getElementById('taskComments').value = '';
    document.getElementById('taskDuration').value = '';
}

function formatBullets(text) {
    if (!text) return '';
    const lines = text.split('\n').filter(l => l.trim() !== '');
    return `<ul class="bullet-list">` + lines.map(l => `<li>${l}</li>`).join('') + `</ul>`;
}

function editTask(index) {
    const t = invoiceData.tasks[index];
    document.getElementById('taskDate').value = t.date;
    document.getElementById('taskMain').value = t.mainTask;
    document.getElementById('taskComments').value = t.comments;
    document.getElementById('taskDuration').value = t.duration;
    
    editIndex = index;
    const btn = document.querySelector('.btn-add');
    btn.innerText = "Save Changes";
    document.getElementById('btn-cancel').style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editIndex = null;
    resetForm();
    document.querySelector('.btn-add').innerText = "Add to Invoice";
    document.getElementById('btn-cancel').style.display = "none";
}

// --- NEW UNDO DELETE LOGIC ---

function deleteTask(index) {
    // Save a snapshot of the single task before deleting
    deletedTaskSnapshot = { ...invoiceData.tasks[index] };
    
    invoiceData.tasks.splice(index, 1);
    save();
    render();

    // Show the Undo button
    const undoBtn = document.getElementById('btn-undo');
    undoBtn.innerText = "↩ Undo Delete Entry";
    undoBtn.style.display = "inline-block";
    
    // Auto-hide after 10 seconds
    setTimeout(() => { 
        if (deletedTaskSnapshot) {
            undoBtn.style.display = "none";
            deletedTaskSnapshot = null;
        }
    }, 10000);
}

function clearInvoice() {
    if(confirm("Clear everything?")) {
        lastSnapshot = [...invoiceData.tasks];
        invoiceData.tasks = [];
        save();
        render();
        
        const undoBtn = document.getElementById('btn-undo');
        undoBtn.innerText = "↩ Undo Clear All";
        undoBtn.style.display = "inline-block";
        
        setTimeout(() => { undoBtn.style.display = "none"; }, 15000);
    }
}

function undoClear() {
    if (lastSnapshot) {
        // Restoring everything
        invoiceData.tasks = lastSnapshot;
        lastSnapshot = null;
    } else if (deletedTaskSnapshot) {
        // Restoring just the one task
        invoiceData.tasks.push(deletedTaskSnapshot);
        invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        deletedTaskSnapshot = null;
    }
    
    document.getElementById('btn-undo').style.display = "none";
    save();
    render();
}

// --- END UNDO LOGIC ---

function save() { localStorage.setItem('monthlyInvoiceData_v1.4', JSON.stringify(invoiceData)); }

function render() {
    document.getElementById('displayUserName').innerText = invoiceData.name || '[Your Name]';
    document.getElementById('displayInvNum').innerText = "INVOICE #" + (invoiceData.num || '');
    document.getElementById('displayClient').innerText = invoiceData.client || '[Client]';
    document.getElementById('displayContact').innerText = invoiceData.contact || '';
    document.getElementById('displayRate').innerText = "$" + invoiceData.rate.toFixed(2);

    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    
    const groups = {};
    invoiceData.tasks.forEach((t, i) => {
        if(!groups[t.date]) groups[t.date] = [];
        groups[t.date].push({...t, originalIndex: i});
    });

    let grandTotal = 0;
    Object.keys(groups).sort().forEach(date => {
        let dayHrs = 0;
        groups[date].forEach(t => dayHrs += t.duration);
        const dayTotal = dayHrs * invoiceData.rate;
        grandTotal += dayTotal;

        const wrap = document.createElement('div');
        wrap.className = 'date-group-wrapper';
        let html = `<div class="date-group-header"><span>${date}</span><span>Day Total: $${dayTotal.toFixed(2)}</span></div>`;
        html += `<table><thead><tr><th>Details</th><th>Hrs</th><th>Amt</th><th class="no-print"></th></tr></thead><tbody>`;
        
        groups[date].forEach(item => {
            html += `<tr><td><strong>${item.mainTask}</strong>${formatBullets(item.comments)}</td><td>${item.duration}</td><td>$${(item.duration * invoiceData.rate).toFixed(2)}</td>
            <td class="no-print"><button class="action-btn" style="color:#3498db" onclick="editTask(${item.originalIndex})">✎</button><button class="action-btn" style="color:#e74c3c" onclick="deleteTask(${item.originalIndex})">✕</button></td></tr>`;
        });
        wrap.innerHTML = html + `</tbody></table>`;
        container.appendChild(wrap);
    });
    document.getElementById('totalDisplay').innerText = "$" + grandTotal.toFixed(2);
}
