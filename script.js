const DEFAULT_RATE = 5.17;
let editIndex = null;

let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceDataV3')) || {
    num: '',
    client: '',
    rate: DEFAULT_RATE,
    tasks: []
};

window.onload = () => {
    document.getElementById('invoiceNum').value = invoiceData.num || '';
    document.getElementById('clientName').value = invoiceData.client || '';
    document.getElementById('hourlyRate').value = invoiceData.rate || DEFAULT_RATE;
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
    const dateEl = document.getElementById('taskDate');
    const mainEl = document.getElementById('taskMain');
    const commEl = document.getElementById('taskComments');
    const durEl = document.getElementById('taskDuration');
    const btnEl = document.querySelector('.btn-add');

    const date = dateEl.value;
    const mainTask = mainEl.value;
    const comments = commEl.value; // This now captures multiple lines
    const duration = parseFloat(durEl.value);

    if (!date || !mainTask || isNaN(duration)) {
        alert("Please fill in Date, Main Task, and Hours.");
        return;
    }

    const newTask = { date, mainTask, comments, duration };

    if (editIndex !== null) {
        invoiceData.tasks[editIndex] = newTask;
        editIndex = null;
        btnEl.innerText = "Add to Invoice";
        btnEl.style.background = ""; 
    } else {
        invoiceData.tasks.push(newTask);
    }
    
    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    
    mainEl.value = '';
    commEl.value = '';
    durEl.value = '';
    render();
}

// Helper to turn text lines into a bulleted list
function formatBullets(text) {
    if (!text) return '';
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return '';
    return `<ul class="bullet-list">` + lines.map(line => `<li>${line}</li>`).join('') + `</ul>`;
}

function editTask(index) {
    const task = invoiceData.tasks[index];
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskMain').value = task.mainTask;
    document.getElementById('taskComments').value = task.comments;
    document.getElementById('taskDuration').value = task.duration;

    editIndex = index;
    const btnEl = document.querySelector('.btn-add');
    btnEl.innerText = "Save Changes";
    btnEl.style.background = "#f39c12"; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteTask(index) {
    if(confirm("Delete this entry?")) {
        invoiceData.tasks.splice(index, 1);
        save();
        render();
    }
}

function clearInvoice() {
    if (confirm("Clear all tasks?")) {
        invoiceData.tasks = [];
        save();
        render();
    }
}

function save() {
    localStorage.setItem('monthlyInvoiceDataV3', JSON.stringify(invoiceData));
}

function render() {
    document.getElementById('displayInvNum').innerText = invoiceData.num ? `INVOICE #${invoiceData.num}` : 'INVOICE';
    document.getElementById('displayClient').innerText = invoiceData.client ? `To: ${invoiceData.client}` : 'To: [Client Name]';
    document.getElementById('displayRate').innerText = `$${invoiceData.rate.toFixed(2)}`;

    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    
    const groups = {};
    invoiceData.tasks.forEach((task, index) => {
        if (!groups[task.date]) groups[task.date] = [];
        groups[task.date].push({ ...task, originalIndex: index });
    });

    let grandTotal = 0;

    Object.keys(groups).sort().forEach(dateString => {
        const dateObj = new Date(dateString + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });

        let dailyHours = 0;
        groups[dateString].forEach(t => dailyHours += t.duration);
        const dailySubtotal = dailyHours * invoiceData.rate;
        grandTotal += dailySubtotal;

        const wrapper = document.createElement('div');
        wrapper.className = 'date-group-wrapper';
        
        let html = `
            <div class="date-group-header">
                <span>${formattedDate}</span>
                <span>Hours: ${dailyHours.toFixed(2)} | Day Total: $${dailySubtotal.toFixed(2)}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 65%">Task Details</th>
                        <th style="width: 10%">Hours</th>
                        <th style="width: 15%">Amount</th>
                        <th class="no-print" style="width: 10%"></th>
                    </tr>
                </thead>
                <tbody>`;

        groups[dateString].forEach(item => {
            const lineTotal = item.duration * invoiceData.rate;
            html += `
                <tr>
                    <td>
                        <strong>${item.mainTask}</strong>
                        ${formatBullets(item.comments)}
                    </td>
                    <td>${item.duration}</td>
                    <td>$${lineTotal.toFixed(2)}</td>
                    <td class="no-print">
                        <button onclick="editTask(${item.originalIndex})" class="action-btn" style="color: #3498db;">✎</button>
                        <button onclick="deleteTask(${item.originalIndex})" class="action-btn" style="color: #e74c3c;">✕</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });

    document.getElementById('totalDispla
