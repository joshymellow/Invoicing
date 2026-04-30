const STORAGE_KEY = 'monthlyInvoiceData_v1.7';
const ARCHIVE_KEY = 'invoiceArchive_v1.7';
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
    dl.setAttribute("download", `Backup_${new Date().toLocaleDateString()}.json`);
    dl.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm("Restore this backup? This will overwrite current live logs.")) {
                invoiceData = imported;
                save();
                location.reload();
            }
        } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
}

// --- ARCHIVING ---
function archiveMonth() {
    if (invoiceData.tasks.length === 0) return alert("No tasks to archive.");
    if (confirm("Close Month? This archives current tasks and clears the live list.")) {
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
        alert("Saved to history!");
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

    if (!date || !main || isNaN(dur)) return alert("Missing entry details.");

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
    document.getElementById('taskMain').value = '';
    document.getElementById('taskComments').value = '';
    document.getElementById('taskDuration').value = '';
    render();
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
}

function cancelEdit() {
    editIndex = null;
    document.querySelector('.btn-add').innerText = "Add to Invoice";
    document.getElementById('btn-cancel').style.display = "none";
    document.getElementById('taskMain').value = '';
}

function deleteTask(index) {
    deletedTaskSnapshot = { ...invoiceData.tasks[index] };
    invoiceData.tasks.splice(index, 1);
    save();
    render();
    const ub = document.getElementById('btn-undo');
    ub.innerText = "↩ Undo Delete";
    ub.style.display = "inline-block";
    setTimeout(() => { ub.style.display = "none"; deletedTaskSnapshot = null; }, 10000);
}

function clearInvoice() {
    if(confirm("Clear all logs?")) {
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
        let html = `<div class="date-group-header"><span>${date}</span><span>$${dayTotal.toFixed(2)}</span></div>`;
        html += `<table><tbody>`;
        groups[date].forEach(item => {
            html += `<tr>
                <td><strong>${item.mainTask}</strong><br><small>${item.comments.replace(/\n/g, '<br>')}</small></td>
                <td style="width:50px">${item.duration}h</td>
                <td class="no-print" style="width:60px">
                    <button class="action-btn" onclick="editTask(${item.originalIndex})">✎</button>
                    <button class="action-btn" onclick="deleteTask(${item.originalIndex})">✕</button>
                </td>
            </tr>`;
        });
        wrap.innerHTML = html + `</tbody></table>`;
        container.appendChild(wrap);
    });

    document.getElementById('totalDisplay').innerText = "$" + grandTotal.toFixed(2);
    
    // Update Stats
    const uniqueDays = [...new Set(invoiceData.tasks.map(t => t.date))].length;
    document.getElementById('statHours').innerText = totalHrs.toFixed(2);
    document.getElementById('statTasks').innerText = invoiceData.tasks.length;
    document.getElementById('statAvg').innerText = "$" + (uniqueDays ? (grandTotal / uniqueDays).toFixed(2) : "0.00");
}
