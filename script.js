// script.js
const DEFAULT_RATE = 5.17;

let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceDataV2')) || {
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
    const dateInput = document.getElementById('taskDate');
    const mainInput = document.getElementById('taskMain');
    const commInput = document.getElementById('taskComments');
    const durInput = document.getElementById('taskDuration');

    const date = dateInput.value;
    const mainTask = mainInput.value;
    const comments = commInput.value;
    const duration = parseFloat(durInput.value);

    if (date && mainTask && !isNaN(duration)) {
        invoiceData.tasks.push({ date, mainTask, comments, duration });
        invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        mainInput.value = '';
        commInput.value = '';
        durInput.value = '';
        
        save();
        render();
    } else {
        alert("Please fill in Date, Main Task, and Hours.");
    }
}

function deleteTask(index) {
    invoiceData.tasks.splice(index, 1);
    save();
    render();
}

function clearInvoice() {
    if (confirm("Clear all tasks?")) {
        invoiceData.tasks = [];
        save();
        render();
    }
}

function save() {
    localStorage.setItem('monthlyInvoiceDataV2', JSON.stringify(invoiceData));
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
                <span class="daily-subtotal-tag">Day Total: $${dailySubtotal.toFixed(2)}</span>
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
                        ${item.comments ? `<span class="comment-text">${item.comments}</span>` : ''}
                    </td>
                    <td>${item.duration}</td>
                    <td>$${lineTotal.toFixed(2)}</td>
                    <td class="no-print">
                        <button class="delete-btn" onclick="deleteTask(${item.originalIndex})">✕</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });

    document.getElementById('totalDisplay').innerText = `$${grandTotal.toFixed(2)}`;
}
