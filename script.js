const STORAGE_KEY = 'monthlyInvoiceData_v1.7';
const ARCHIVE_KEY = 'invoiceArchive_v1.7';
let editIndex = null;
let lastSnapshot = null;
let deletedTaskSnapshot = null;

let invoiceData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    name: '', num: '', client: '', contact: '', rate: 5.17, theme: 'classic', tasks: []
};

window.onload = () => {
    // Fill Meta Data
    document.getElementById('userName').value = invoiceData.name;
    document.getElementById('invoiceNum').value = invoiceData.num;
    document.getElementById('clientName').value = invoiceData.client;
    document.getElementById('contactInfo').value = invoiceData.contact;
    document.getElementById('hourlyRate').value = invoiceData.rate;
    document.getElementById('themeSelect').value = invoiceData.theme || 'classic';
    
    document.getElementById('taskDate').valueAsDate = new Date();
    document.getElementById('issueDate').innerText = new Date().toLocaleDateString();
    
    changeTheme(); 
    render();
};

// --- DATA PERSISTENCE & BACKUP ---

function save() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData)); 
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoiceData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `invoice_backup_${new Date().toLocaleDateString()}.json`);
    downloadAnchor.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm("Overwrite current data with this backup?")) {
                invoiceData = imported;
                save();
                location.reload();
            }
        } catch (err) { alert("Invalid Backup File."); }
    };
    reader.readAsText(file);
}

// --- ARCHIVING ---

function archiveMonth() {
    if (invoiceData.tasks.length === 0) return alert("Nothing to archive.");
    if (confirm("This will save the current tasks to History and clear the live list. Proceed?")) {
        let archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
        archives.push({
            dateArchived: new Date().toISOString(),
            client: invoiceData.client,
            total: document.getElementById('totalDisplay').innerText,
            tasks: [...invoiceData.tasks]
        });
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
        invoiceData.tasks = [];
        save();
        render();
        alert("Month archived successfully!");
    }
}

// --- STATS & THEMES ---

function updateStats() {
    let totalHrs = 0;
    invoiceData.tasks.forEach(t => totalHrs += t.duration);
    
    // Calculate distinct days worked
    const uniqueDays = [...new Set(invoiceData.tasks.map(t => t.date))].length;
    const dailyAvg = uniqueDays > 0 ? (totalHrs * invoiceData.rate) / uniqueDays : 0;

    document.getElementById('statHours').innerText = totalHrs.toFixed(2);
    document.getElementById('statAvg').innerText = "$" + dailyAvg.toFixed(2);
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    invoiceData.theme = theme;
    save();
    
    if (theme === 'minimal') {
        document.documentElement.style.setProperty('--primary', '#444');
        document.documentElement.style.setProperty('--accent', '#999');
    } else {
        document.documentElement.style.setProperty('--primary', '#2c3e50');
        document.documentElement.style.setProperty('--accent', '#3498db');
    }
}

// --- CORE LOGIC (Restored & Improved) ---

function addTask() {
    const date = document.getElementById('taskDate').value;
    const mainTask = document.getElementById('taskMain').value;
    const comments = document.getElementById('taskComments').value;
    const duration = parseFloat(document.getElementById('taskDuration').value);

    if (!date || !mainTask || isNaN(duration)) return alert("Fill required fields.");

    const entry = { date, mainTask, comments, duration };
    if (editIndex !== null) {
        invoiceData.tasks[editIndex] = entry;
        editIndex = null;
        document.getElementById('btn-cancel').style.display = "none";
    } else {
        invoiceData.tasks.push(entry);
    }

    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    render();
    document.getElementById('taskMain').value = '';
    document.getElementById('taskComments').value = '';
    document.getElementById('taskDuration').value = '';
}

// ... include editTask, cancelEdit, deleteTask, clearInvoice, undoClear from v1.6 ...

function render() {
    // Meta Updates
    document.getElementById('displayUserName').innerText = invoiceData.name || '[Name]';
    document.getElementById('displayInvNum').innerText = "INVOICE #" + (invoiceData.num || '');
    document.getElementById('displayClient').innerText = invoiceData.client || '[Client]';
    document.getElementById('displayContact').innerText = invoiceData.contact || '';
    document.getElementById('displayRate').innerText = "$" + (invoiceData.rate || 0).toFixed(2);

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
        let html = `<div class="date-group-header"><span>${date}</span><span>$${dayTotal.toFixed(2)}</span></div>`;
        html += `<table><tbody>`;
        groups[date].forEach(item => {
            html += `<tr><td><strong>${item.mainTask}</strong><br>${item.comments.replace(/\n/g, '<br>')}</td>
            <td style="width:40px">${item.duration}h</td>
            <td class="no-print"><button onclick="editTask(${item.originalIndex})">✎</button></td></tr>`;
        });
        wrap.innerHTML = html + `</tbody></table>`;
        container.appendChild(wrap);
    });
    
    document.getElementById('totalDisplay').innerText = "$" + grandTotal.toFixed(2);
    updateStats();
}
