const hourlyRate = 50; // Set your rate here
let tasks = JSON.parse(localStorage.getItem('invoiceTasks')) || [];

// Load existing tasks on startup
window.onload = () => {
    renderTable();
};

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

        // Clear inputs
        descInput.value = '';
        durationInput.value = '';
    } else {
        alert("Please enter both a description and duration.");
    }
}

function saveAndRender() {
    localStorage.setItem('invoiceTasks', JSON.stringify(tasks));
    renderTable();
}

function renderTable() {
    const tableBody = document.getElementById('taskList');
    let totalAmount = 0;
    
    tableBody.innerHTML = ''; // Clear current view

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
    if (confirm("Are you sure you want to clear the entire invoice?")) {
        tasks = [];
        saveAndRender();
    }
}
