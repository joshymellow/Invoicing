const DEFAULT_RATE = 5.17;
let editIndex = null; // Tracks if we are editing an existing item

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
    const dateEl = document.getElementById('taskDate');
    const mainEl = document.getElementById('taskMain');
    const commEl = document.getElementById('taskComments');
    const durEl = document.getElementById('taskDuration');
    const btnEl = document.querySelector('.btn-add');

    const date = dateEl.value;
    const mainTask = mainEl.value;
    const comments = commEl.value;
    const duration = parseFloat(durEl.value);

    if (!date || !mainTask || isNaN(duration)) {
        alert("Please fill in Date, Main Task, and Hours.");
        return;
    }

    const newTask = { date, mainTask, comments, duration };

    if (editIndex !== null) {
        // Update existing task
        invoiceData.tasks[editIndex] = newTask;
        editIndex = null;
        btnEl.innerText = "Add to Invoice";
        btnEl.style.background = ""; // Reset to original blue
    } else {
        // Add new task
        invoiceData.tasks.push(newTask);
    }
    
    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    
    // Clear inputs
    mainEl.value = '';
    commEl.value = '';
    durEl.value = '';
    render();
}

function editTask(index) {
    const task = invoiceData.tasks[index];
    
    // Load values back into the form
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskMain').value = task.mainTask;
    document.getElementById('taskComments').value = task.comments;
    document.getElementById('taskDuration').value = task.duration;

    // Set UI to Edit Mode
    editIndex = index;
    const btnEl = document.querySelector('.btn-add');
    btnEl.innerText = "Save Changes";
    btnEl.style.background = "#f39c12"; // Orange to indicate editing
    
    // Scroll to top
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
        wrapper.style.marginBottom = "20px";
        wrapper.style.border = "1px solid #ddd";
        wrapper.style.borderRadius = "8px";
        wrapper.style.overflow = "hidden";
        
        let html = `
            <div class="date-group-header" style="background: #2c3e50; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">${formattedDate}</span>
                <span style="font-size: 0.9rem; opacity: 0.9;">
                    Hours: ${dailyHours.toFixed(2)} | Subtotal: $${dailySubtotal.toFixed(2)}
                </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: white;">
                <thead>
                    <tr style="text-align: left; background: #f1f1f1; font-size: 0.8rem;">
                        <th style="padding: 10px;">Details</th>
                        <th style="padding: 10px;">Hrs</th>
                        <th style="padding: 10px;">Amt</th>
                        <th class="no-print" style="padding: 10px; width: 80px;">Action</th>
                    </tr>
                </thead>
                <tbody>`;

        groups[dateString].forEach(item => {
            const lineTotal = item.duration * invoiceData.rate;
            html += `
                <tr style="border-top: 1px solid #eee;">
                    <td style="padding: 10px;">
                        <strong style="display:block;">${item.mainTask}</strong>
                        ${item.comments ? `<small style="color: #666;">${item.comments}</small>` : ''}
                    </td>
                    <td style="padding: 10px;">${item.duration}</td>
                    <td style="padding: 10px;">$${lineTotal.toFixed(2)}</td>
                    <td class="no-print" style="padding: 10px; white-space: nowrap;">
                        <button onclick="editTask(${item.originalIndex})" style="color: #3498db; border: none; background: none; cursor: pointer; padding-right: 10px;">✎</button>
                        <button onclick="deleteTask(${item.originalIndex})" style="color: #e74c3c; border: none; background: none; cursor: pointer;">✕</button>
                    </td>
                </tr>`;
        });

        html += `</tbody></table>`;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });

    document.getElementById('totalDisplay').innerText = `$${grandTotal.toFixed(2)}`;
}
