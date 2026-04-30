const STORAGE_KEY = 'invoice_data_final_v1';
let editIndex = null;
let lastSnapshot = null;

let invoiceData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    name: '', num: '', client: '', contact: '', rate: 5.17, tasks: []
};

// Sync UI on Load
window.onload = () => {
    document.getElementById('userName').value = invoiceData.name;
    document.getElementById('invoiceNum').value = invoiceData.num;
    document.getElementById('clientName').value = invoiceData.client;
    document.getElementById('contactInfo').value = invoiceData.contact;
    document.getElementById('hourlyRate').value = invoiceData.rate;
    document.getElementById('taskDate').valueAsDate = new Date();
    document.getElementById('issueDate').innerText = new Date().toLocaleDateString();
    render();
};

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData)); }

function updateMeta() {
    invoiceData.name = document.getElementById('userName').value;
    invoiceData.num = document.getElementById('invoiceNum').value;
    invoiceData.client = document.getElementById('clientName').value;
    invoiceData.contact = document.getElementById('contactInfo').value;
    invoiceData.rate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    save();
    render();
}

function refineTasks() {
    const commEl = document.getElementById('taskComments');
    let text = commEl.value;
    if (!text) return;
    const upgrades = [
        { f: /\bfixed\b/gi, r: "Resolved" },
        { f: /\btalked to\b/gi, r: "Liaised with" },
        { f: /\bmade\b/gi, r: "Developed" },
        { f: /\bbug\b/gi, r: "technical issue" }
    ];
    upgrades.forEach(u => { text = text.replace(u.f, u.r); });
    commEl.value = text.split('\n').map(line => '• ' + line.replace(/^[•\-\*\s]+/, '').trim()).join('\n');
}

function addTask() {
    const date = document.getElementById('taskDate').value;
    const main = document.getElementById('taskMain').value;
    const dur = parseFloat(document.getElementById('taskDuration').value);
    const comm = document.getElementById('taskComments').value;

    if (!date || !main || isNaN(dur)) {
        alert("Missing fields!");
        return;
    }

    const entry = { date, mainTask: main, duration: dur, comments: comm };

    if (editIndex !== null) {
        invoiceData.tasks[editIndex] = entry;
        editIndex = null;
        document.getElementById('mainAddBtn').innerText = "Add to Invoice";
        document.getElementById('btn-cancel').style.display = "none";
    } else {
        invoiceData.tasks.push(entry);
    }

    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    
    // Clear inputs
    document.getElementById('taskMain').value = '';
    document.getElementById('taskDuration').value = '';
    document.getElementById('taskComments').value = '';
    
    render();
}

function editTask(index) {
    const t = invoiceData.tasks[index];
    document.getElementById('taskDate').value = t.date;
    document.getElementById('taskMain').value = t.mainTask;
    document.getElementById('taskDuration').value = t.duration;
    document.getElementById('taskComments').value = t.comments;
    editIndex = index;
    document.getElementById('mainAddBtn').innerText = "Save Changes";
    document.getElementById('btn-cancel').style.display = "inline-block";
}

function cancelEdit() {
    editIndex = null;
    document.getElementById('mainAddBtn').innerText = "Add to Invoice";
    document.getElementById('btn-cancel').style.display = "none";
    document.getElementById('taskMain').value = '';
}

function deleteTask(index) {
    invoiceData.tasks.splice(index, 1);
    save();
    render();
}

function clearInvoice() {
    if(confirm("Clear everything?")) {
        lastSnapshot = [...invoiceData.tasks];
        invoiceData.tasks = [];
        save();
        render();
        document.getElementById('btn-undo').style.display = "inline-block";
    }
}

function undoClear() {
    invoiceData.tasks = lastSnapshot;
    document.getElementById('btn-undo').style.display = "none";
    save();
    render();
}

function render() {
    document.getElementById('displayUserName').innerText = invoiceData.name || '[Name]';
    document.getElementById('displayInvNum').innerText = "INVOICE #" + invoiceData.num;
    document.getElementById('displayClient').innerText = invoiceData.client;
    document.getElementById('displayContact').innerText = invoiceData.contact;
    document.getElementById('displayRate').innerText = "$" + invoiceData.rate.toFixed(2);

    const cont = document.getElementById('tasksContainer');
    cont.innerHTML = '';
    
    let total = 0;
    invoiceData.tasks.forEach((t, i) => {
        total += (t.duration * invoiceData.rate);
        const row = document.createElement('div');
        row.className = 'date-group-wrapper';
        row.innerHTML = `
            <div class="date-group-header"><span>${t.date}</span></div>
            <table style="width:100%"><tr>
                <td><strong>${t.mainTask}</strong><br><small>${t.comments.replace(/\n/g, '<br>')}</small></td>
                <td style="width:50px">${t.duration}h</td>
                <td style="width:80px">$${(t.duration * invoiceData.rate).toFixed(2)}</td>
                <td class="no-print" style="width:60px">
                    <button onclick="editTask(${i})">✎</button>
                    <button onclick="deleteTask(${i})">✕</button>
                </td>
            </tr></table>`;
        cont.appendChild(row);
    });
    document.getElementById('totalDisplay').innerText = "$" + total.toFixed(2);
}
