const hourlyRate = 50; 
let tasks = JSON.parse(localStorage.getItem('invoiceTasks')) || [];

window.onload = () => {
    // Load Invoice Number
    const savedNum = localStorage.getItem('invoiceNum') || '';
    document.getElementById('invoiceNum').value = savedNum;
    document.getElementById('displayInvNum').innerText = savedNum ? `INVOICE #${savedNum}` : 'INVOICE';

    // Set Today's Date
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();

    renderTable();
};

// Saves invoice number to storage as you type
function saveInvoiceNum() {
    const num = document.getElementById('invoiceNum').value;
    localStorage.setItem('invoiceNum', num);
    document.getElementById('displayInvNum').innerText = num ? `INVOICE #${num}` : 'INVOICE';
}

function addTask() {
    const descInput = document.getElementById('taskDesc');
    const durationInput = document.getElementById('taskDuration');
    
    const desc = descInput.value;
    const duration = parseFloat(durationInput.value);

    if (desc && duration) {
        const newTask = {
            description: desc,
            duration: duration,
            amount: duration * hourlyRate
        };

        tasks.push(newTask);
        saveAndRender();

        descInput.value = '';
        durationInput.value = '';
    }
}

function saveAndRender() {
    localStorage.setItem('invoiceTasks', JSON.stringify(tasks));
    renderTable();
}

function renderTable() {
    const tableBody = document.getElementById('taskList');
    let totalAmount = 0;
    tableBody.innerHTML = ''; 

    tasks.forEach((task, index) => {
        totalAmount += task.amount;
        tableBody.innerHTML += `
            <tr>
                <td>${task.description}</td>
                <td>${task.duration}</td>
                <td>$${task.amount.toFixed(2)}</td>
                <td class="no-print">
                    <button onclick="deleteTask(${index})" style="color:red; border:none; background:none; cursor:pointer;">✕</button>
                </td>
            </tr>`;
    });

    document.getElementById('totalDisplay').innerText = `Total: $${totalAmount.toFixed(2)}`;
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveAndRender();
}

function clearInvoice() {
    if (confirm("Clear all tasks and invoice number?")) {
        tasks = [];
        localStorage.removeItem('invoiceNum');
        document.getElementById('invoiceNum').value = '';
        saveAndRender();
    }
}
