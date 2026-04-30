// script.js
const DEFAULT_RATE = 5.17;

let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceDataV2')) || {
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
    // 1. Grab the elements
    const dateEl = document.getElementById('taskDate');
    const mainEl = document.getElementById('taskMain');
    const commEl = document.getElementById('taskComments');
    const durEl = document.getElementById('taskDuration');

    // 2. Extract values
    const date = dateEl.value;
    const mainTask = mainEl.value;
    const comments = commEl.value;
    const duration = parseFloat(durEl.value);

    // 3. Validate
    if (!date || !mainTask || isNaN(duration)) {
        alert("Please fill in Date, Main Task, and Hours.");
        return;
    }

    // 4. Push data
    invoiceData.tasks.push({ date, mainTask, comments, duration });
    
    // 5. Sort and Save
    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    
    // 6. Clear inputs & Refresh
    mainEl.value = '';
    commEl.value = '';
    durEl.value = '';
    render();
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
            <div class="date-group-header" style="background: #f8f9fa; padding: 10px; display: flex; justify-content: space-between; border-bottom: 1px solid #ddd;">
                <span>${formattedDate}</span>
                <span style="background: #2c3e50; color: white; padding: 2px 8px; border-radius: 4px;">Day Total: $${dailySubtotal.toFixed(2)}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="text-align: left; background: #fafafa;">
                        <th style="padding: 10px; width: 60%;">Details</th>
                        <th style="padding: 10px; width: 15%;">Hours</th>
                        <th style="padding: 10px; width: 15%;">Amount</th>
                        <th class="no-print" style="padding: 10px; width: 10%;"></th>
                    </tr>
                </thead>
                <tbody>`;

        groups[dateString].forEach(item => {
            const lineTotal = item.duration * invoiceData.rate;
            html += `
                <tr style="border-top: 1px solid #eee;">
                    <td style="padding: 10px;">
                        <strong>${item.mainTask}</strong>
                        ${item.comments ? `<br><small style="color: #666; font-style: italic;">${item.comments}</small>` : ''}
                    </td>
                    <td style="padding: 10px;">${item.duration}</td>
                    <td style="padding: 10px;">$${lineTotal.toFixed(2)}</td>
                    <td class="no-print" style="padding: 10px;">
                        <button onclick="deleteTask(${item.originalIndex})" style="color: red; border: none; background: none; cursor: pointer;">✕</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });

    document.getElementById('totalDisplay').innerText = `$${grandTotal.toFixed(2)}`;
}
