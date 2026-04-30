const hourlyRate = 50; // Change this to your rate
let totalAmount = 0;

function addTask() {
    const desc = document.getElementById('taskDesc').value;
    const duration = parseFloat(document.getElementById('taskDuration').value);

    if (desc && duration) {
        const table = document.getElementById('taskList');
        const amount = duration * hourlyRate;
        
        // Create new row
        const row = `<tr>
            <td>${desc}</td>
            <td>${duration}</td>
            <td>$${amount.toFixed(2)}</td>
        </tr>`;
        
        table.innerHTML += row;
        
        // Update Total
        totalAmount += amount;
        document.getElementById('totalDisplay').innerText = `Total: $${totalAmount.toFixed(2)}`;

        // Clear inputs
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskDuration').value = '';
    } else {
        alert("Please enter both a description and duration.");
    }
}
