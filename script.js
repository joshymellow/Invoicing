const DEFAULT_RATE = 5.17;
let editIndex = null;

let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceDataV5')) || {
    num: '',
    client: '',
    rate: DEFAULT_RATE,
    tasks: []
};

window.onload = () => {
    document.getElementById('invoiceNum').value = invoiceData.num;
    document.getElementById('clientName').value = invoiceData.client;
    document.getElementById('hourlyRate').value = invoiceData.rate;
    document.getElementById('taskDate').valueAsDate = new Date();
    document.getElementById('issueDate').innerText = new Date().toLocaleDateString();
    render();
};

function updateMeta() {
    invoiceData.num = document.getElementById('invoiceNum').value;
    invoiceData.client = document.getElementById('clientName').value;
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
        const btn = document.querySelector('.btn-add');
        btn.innerText = "Add to Invoice";
        btn.style.background = "";
    } else {
        invoiceData.tasks.push(entry);
    }

    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    
    document.getElementById('taskMain').value = '';
    document.getElementById('taskComments').value = '';
    document.getElementById('taskDuration').value = '';
    render();
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
    btn.style.background = "#f39c12";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTask(index) {
    if(confirm("Delete entry?")) {
        invoiceData.tasks.splice(index, 1);
        save();
        render();
    }
}

function clearInvoice() {
    if(confirm("Clear all data?")) {
        invoiceData.tasks = [];
        save();
        render();
    }
}

function save() { localStorage.setItem('monthlyInvoiceDataV5', JSON.stringify(invoiceData)); }

function render() {
    document.getElementById('displayInvNum').innerText = invoiceData.num ? `INVOICE #${invoiceData.num}` : 'INVOICE';
    document.getElementById('displayClient').innerText = `To: ${invoiceData.client || '[Client Name]'}`;
    document.getElementById('displayRate').innerText = `$${invoiceData.rate.toFixed(2)}`;

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
        let html = `<div class="date-group-header"><span>${new Date(date + 'T00:00:00').toLocaleDateString()}</span><span>Hours: ${dayHrs.toFixed(2)} | Day: $${dayTotal.toFixed(2)}</span></div>`;
        html += `<table><thead><tr><th>Details</th><th>Hrs</th><th>Amt</th><th class="no-print"></th></tr></thead><tbody>`;
        
        groups[date].forEach(item => {
            html += `<tr><td><strong>${item.mainTask}</strong>${formatBullets(item.comments)}</td><td>${item.duration}</td><td>$${(item.duration * invoiceData.rate).toFixed(2)}</td>
            <td class="no-print"><button class="action-btn" style="color:#3498db" onclick="editTask(${item.originalIndex})">✎</button><button class="action-btn" style="color:#e74c3c" onclick="deleteTask(${item.originalIndex})">✕</button></td></tr>`;
        });
        wrap.innerHTML = html + `</tbody></table>`;
        container.appendChild(wrap);
    });
    document.getElementById('totalDisplay').innerText = `$${grandTotal.toFixed(2)}`;
}
