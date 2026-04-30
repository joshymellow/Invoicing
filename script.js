// script.js
const DEFAULT_RATE = 5.17;

let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceData')) || {
    num: '',
    client: '',
    rate: DEFAULT_RATE,
    tasks: []
};

window.onload = () => {
    // Populate form fields
    document.getElementById('invoiceNum').value = invoiceData.num;
    document.getElementById('clientName').value = invoiceData.client;
    document.getElementById('hourlyRate').value = invoiceData.rate;
    
    // Default task date to today
    document.getElementById('taskDate').valueAsDate = new Date();
    
    // Set issuance date on invoice
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
    const descInput = document.getElementById('taskDesc');
    const durInput = document.getElementById('taskDuration');

    const date = dateInput.value;
    const desc = descInput.value;
    const duration = parseFloat(durInput.value);

    if (date && desc && !isNaN(duration)) {
        invoiceData.tasks.push({ date, desc, duration });
        
        // Sort chronologically
        invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Clear inputs for next entry
        descInput.value = '';
        durInput.value = '';
        
        save();
        render();
    } else {
        alert("Please ensure Date, Description, and Hours are filled correctly.");
    }
}

function deleteTask(index) {
    invoiceData.tasks.splice(index, 1);
    save();
    render();
}

function clearInvoice() {
    if (confirm("Are you sure you want to clear all tasks?")) {
        invoiceData.tasks = [];
        save();
        render();
    }
}

function save() {
    localStorage.setItem('monthlyInvoiceData', JSON.stringify(invoiceData));
}

function render() {
    // Update Header Display
    document.getElementById('displayInvNum').innerText = invoiceData.num ? `INVOICE #${invoiceData.num}` : 'INVOICE';
    document.getElementById('displayClient').innerText = invoiceData.client ? `To: ${invoiceData.client}` : 'To: [Client Name]';
    document.getElementById('displayRate').innerText = `$${invoiceData.rate.toFixed(2)}`;

    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    
    // Group tasks by Date
    const groups = {};
    invoiceData.tasks.forEach((task, index) => {
        if (!groups[task.date]) groups[task.date] = [];
        groups[task.date].push({ ...task, originalIndex: index });
    });

    let grandTotal = 0;

    // Render grouped tables
    Object.keys(groups).sort().forEach(dateString => {
        const dateObj = new Date(dateString + 'T00:00:00'); // Ensure local timezone
        const formattedDate = dateObj.toLocaleDateString(undefined, { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });

        const section = document.createElement('div');
        section.className = 'date-section';
        
        let html = `<div class="date-group-header">${formattedDate}</div>`;
        html += `<table>
                    <thead>
                        <tr>
                            <th style="width: 60%">Description</th>
                            <th style="width: 15%">Hours</th>
                            <th style="width: 15%">Amount</th>
                            <th class="no-print" style="width: 10%"></th>
                        </tr>
                    </thead>
                    <tbody>`;

        groups[dateString].forEach(item => {
            const subtotal = item.duration * invoiceData.rate;
            grandTotal += subtotal;
            html += `
                <tr>
                    <td>${item.desc}</td>
                    <td>${item.duration}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td class="no-print">
                        <button class="delete-btn" onclick="deleteTask(${item.originalIndex})">✕</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        section.innerHTML = html;
        container.appendChild(section);
    });

    document.getElementById('totalDisplay').innerText = `$${grandTotal.toFixed(2)}`;
}
