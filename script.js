const STORAGE_KEY = 'monthlyInvoiceData_v1.8';
const ARCHIVE_KEY = 'invoiceArchive_v1.8';
let editIndex = null;
let lastSnapshot = null;
let deletedTaskSnapshot = null;

let invoiceData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    name: '', num: '', client: '', contact: '', rate: 5.17, theme: 'classic', tasks: []
};

window.onload = () => {
    document.getElementById('userName').value = invoiceData.name || '';
    document.getElementById('invoiceNum').value = invoiceData.num || '';
    document.getElementById('clientName').value = invoiceData.client || '';
    document.getElementById('contactInfo').value = invoiceData.contact || '';
    document.getElementById('hourlyRate').value = invoiceData.rate || 5.17;
    document.getElementById('themeSelect').value = invoiceData.theme || 'classic';
    
    document.getElementById('taskDate').valueAsDate = new Date();
    document.getElementById('issueDate').innerText = new Date().toLocaleDateString();
    
    changeTheme(); 
    render();
};

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData)); }

// --- BACKUP & RESTORE ---
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoiceData));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `Invoice_Backup_${new Date().toLocaleDateString()}.json`);
    dl.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm("Restore this backup? This will overwrite your current screen.")) {
                invoiceData = imported;
                save();
                location.reload();
            }
        } catch (err) { alert("Invalid backup file format."); }
    };
    reader.readAsText(file);
}

// --- ARCHIVING ---
function archiveMonth() {
    if (invoiceData.tasks.length === 0) return alert("No tasks to archive.");
    if (confirm("Close Month? This archives current tasks to history and clears your current invoice.")) {
        let archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
        archives.push({
            archivedAt: new Date().toISOString(),
            client: invoiceData.client,
            total: document.getElementById('totalDisplay').innerText,
            tasks: [...invoiceData.tasks]
        });
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
        invoiceData.tasks = [];
        save();
        render();
        alert("Invoice moved to History.");
    }
}

// --- HISTORY UI ---
function toggleHistory() {
    const modal = document.getElementById('historyModal');
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) renderHistory();
}

function renderHistory() {
    const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
    const list = document.getElementById('historyList');
    if (archives.length === 0) {
        list.innerHTML = "<p style='text-align:center; color:#999;'>Your history is empty.</p>";
        return;
    }
    list.innerHTML = archives.map((item, index) => `
        <div class="history-item">
            <div>
                <strong>${item.client || 'Unnamed Client'}</strong><br>
                <small>${new Date(item.archivedAt).toLocaleDateString()}</small>
            </div>
            <div style="text-align:right">
                <div style="font-weight:bold; color:var(--primary);">${item.total}</div>
                <button class="action-btn" style="color:var(--accent); font-size:0.75rem;" onclick="restoreArchive(${index})">Restore</button>
                <button class="action-btn" style="color:#e74c3c; font-size:0.75rem;" onclick="deleteArchive(${index})">Delete</button>
            </div>
        </div>
    `).reverse().join('');
}

function restoreArchive(index) {
    if (confirm("Restoring this will replace your current live data. Continue?")) {
        const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY));
        invoiceData.tasks = archives[index].tasks;
        invoiceData.client = archives[index].client;
        save();
        render();
        toggleHistory();
    }
}

function deleteArchive(index) {
    if (confirm("Permanently delete this record?")) {
        let archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY));
        archives.splice(index, 1);
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
        renderHistory();
    }
}

// --- CORE ENGINE ---
function updateMeta() {
    invoiceData.name = document.getElementById('userName').value;
    invoiceData.num = document.getElementById('invoiceNum').value;
    invoiceData.client = document.getElementById('clientName').value;
    invoiceData.contact = document.getElementById('contactInfo').value;
    invoiceData.rate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    save();
    render();
}

function addTask() {
    const date = document.getElementById('taskDate').value;
    const main = document.getElementById('taskMain').value;
    const comm = document.getElementById('taskComments').value;
    const dur = parseFloat(document.getElementById('taskDuration').value);

    if (!date || !main || isNaN(dur)) return alert("Please fill in Date, Task, and Hours.");

    const entry = { date, mainTask: main, comments: comm, duration: dur };

    if (editIndex !== null) {
        invoiceData.tasks[editIndex] = entry;
        editIndex = null;
        document.querySelector('.btn-add').innerText = "Add to Invoice";
        document.getElementById('btn-cancel').style.display = "none";
    } else {
        invoiceData.tasks.push(entry);
    }

    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    resetForm();
    render();
}

function resetForm() {
    document.getElementById('taskMain').value = '';
    document.getElementById('taskComments').value = '';
    document.getElementById('taskDuration').value = '';
}

function editTask(index) {
    const t = invoiceData.tasks[index];
    document.getElementById('taskDate').value = t.date;
    document.getElementById('taskMain').value = t.mainTask;
    document.getElementById('taskComments').value = t.comments;
    document.getElementById('taskDuration').value = t.duration;
    editIndex = index;
    document.querySelector('.btn-add').innerText = "Save Changes";
    document.getElementById('btn-cancel').style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editIndex = null;
    resetForm();
    document.querySelector('.btn-add').innerText = "Add to Invoice";
    document.getElementById('btn-cancel').style.display = "none";
}

function deleteTask(index) {
    deletedTaskSnapshot = { ...invoiceData.tasks[index] };
    invoiceData.tasks.splice(index, 1);
    save();
    render();
    const ub = document.getElementById('btn-undo');
    ub.innerText = "↩ Undo Delete Entry";
    ub.style.display = "inline-block";
    setTimeout(() => { ub.style.display = "none"; deletedTaskSnapshot = null; }, 10000);
}

function clearInvoice() {
    if(confirm("Permanently clear all active tasks?")) {
        lastSnapshot = [...invoiceData.tasks];
        invoiceData.tasks = [];
        save();
        render();
        const ub = document.getElementById('btn-undo');
        ub.innerText = "↩ Undo Clear All";
        ub.style.display = "inline-block";
        setTimeout(() => { ub.style.display = "none"; lastSnapshot = null; }, 15000);
    }
}

function undoClear() {
    if (lastSnapshot) invoiceData.tasks = lastSnapshot;
    else if (deletedTaskSnapshot) invoiceData.tasks.push(deletedTaskSnapshot);
    lastSnapshot = null; deletedTaskSnapshot = null;
    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    document.getElementById('btn-undo').style.display = "none";
    save();
    render();
}

function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    invoiceData.theme = theme;
    save();
    const root = document.documentElement;
    if (theme === 'minimal') {
        root.style.setProperty('--primary', '#444444');
        root.style.setProperty('--accent', '#7f8c8d');
    } else {
        root.style.setProperty('--primary', '#2c3e50');
        root.style.setProperty('--accent', '#3498db');
    }
}

function formatBullets(text) {
    if (!text) return '';
    const lines = text.split('\n').filter(l => l.trim() !== '');
    return `<ul class="bullet-list">` + lines.map(l => `<li>${l}</li>`).join('') + `</ul>`;
}

function render() {
    document.getElementById('displayUserName').innerText = invoiceData.name || '[Your Name]';
    document.getElementById('displayInvNum').innerText = "INVOICE #" + (invoiceData.num || '');
    document.getElementById('displayClient').innerText = invoiceData.client || '[Client]';
    document.getElementById('displayContact').innerText = invoiceData.contact || '';
    document.getElementById('displayRate').innerText = "$" + invoiceData.rate.toFixed(2);

    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    
    let totalHrs = 0;
    let grandTotal = 0;
    const groups = {};
    invoiceData.tasks.forEach((t, i) => {
        if(!groups[t.date]) groups[t.date] = [];
        groups[t.date].push({...t, originalIndex: i});
        totalHrs += t.duration;
    });

    Object.keys(groups).sort().forEach(date => {
        let dayHrs = 0;
        groups[date].forEach(t => dayHrs += t.duration);
        const dayTotal = dayHrs * invoiceData.rate;
        grandTotal += dayTotal;

        const wrap = document.createElement('div');
        wrap.className = 'date-group-wrapper';
        let html = `<div class="date-group-header"><span>${date}</span><span>Day: $${dayTotal.toFixed(2)}</span></div>`;
        html += `<table><tbody>`;
        groups[date].forEach(item => {
            html += `<tr>
                <td><strong>${item.mainTask}</strong>${formatBullets(item.comments)}</td>
                <td style="width:50px">${item.duration}h</td>
                <td class="no-print" style="width:70px; text-align:right;">
                    <button class="action-btn" style="color:var(--accent)" onclick="editTask(${item.originalIndex})">✎</button>
                    <button class="action-btn" style="color:#e74c3c" onclick="deleteTask(${item.originalIndex})">✕</button>
                </td>
            </tr>`;
        });
        wrap.innerHTML = html + `</tbody></table>`;
        container.appendChild(wrap);
    });

    document.getElementById('totalDisplay').innerText = "$" + grandTotal.toFixed(2);
    
    const uniqueDays = [...new Set(invoiceData.tasks.map(t => t.date))].length;
    document.getElementById('statHours').innerText = totalHrs.toFixed(2);
    document.getElementById('statTasks').innerText = invoiceData.tasks.length;
    document.getElementById('statAvg').innerText = "$" + (uniqueDays ? (grandTotal / uniqueDays).toFixed(2) : "0.00");
}
