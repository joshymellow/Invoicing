/* script.js - v1.5 Master Release */

const DEFAULT_RATE = 5.17;
let editIndex = null;
let lastSnapshot = null;

// Initialize data from LocalStorage or use Defaults
let invoiceData = JSON.parse(localStorage.getItem('monthlyInvoiceData_v1.5')) || {
    name: '',
    num: '',
    client: '',
    contact: 'codornizjoshuaisaiah@gmail.com',
    rate: DEFAULT_RATE,
    tasks: []
};

// --- INITIALIZATION ---
window.onload = () => {
    document.getElementById('userName').value = invoiceData.name || '';
    document.getElementById('invoiceNum').value = invoiceData.num || '';
    document.getElementById('clientName').value = invoiceData.client || '';
    document.getElementById('contactInfo').value = invoiceData.contact || '';
    document.getElementById('hourlyRate').value = invoiceData.rate || DEFAULT_RATE;
    
    // Set default date to today
    document.getElementById('taskDate').valueAsDate = new Date();
    document.getElementById('issueDate').innerText = new Date().toLocaleDateString();
    
    render();
};

// --- CORE LOGIC ---

function updateMeta() {
    invoiceData.name = document.getElementById('userName').value;
    invoiceData.num = document.getElementById('invoiceNum').value;
    invoiceData.client = document.getElementById('clientName').value;
    invoiceData.contact = document.getElementById('contactInfo').value;
    invoiceData.rate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    save();
    render();
}

/**
 * THE REFINEMENT ENGINE
 * Swaps common verbs for professional equivalents and standardizes formatting.
 */
function refineTasks() {
    const commEl = document.getElementById('taskComments');
    let text = commEl.value;
    if (!text) return;

    const upgrades = [
        { find: /\bfixed\b/gi, replace: "Resolved" },
        { find: /\bhelped\b/gi, replace: "Assisted with" },
        { find: /\bstarted\b/gi, replace: "Initiated" },
        { find: /\bfinished\b/gi, replace: "Completed" },
        { find: /\btalked to\b/gi, replace: "Liaised with" },
        { find: /\bemailed\b/gi, replace: "Corresponded with" },
        { find: /\bchanged\b/gi, replace: "Updated" },
        { find: /\bmade\b/gi, replace: "Developed" },
        { find: /\bchecked\b/gi, replace: "Reviewed" },
        { find: /\blooked at\b/gi, replace: "Analyzed" },
        { find: /\bworked on\b/gi, replace: "Focused on" },
        { find: /\bbug\b/gi, replace: "technical issue" },
        { find: /\bstuff\b/gi, replace: "requirements" },
        { find: /\berror\b/gi, replace: "discrepancy" },
        { find: /\bmeeting\b/gi, replace: "consultation" }
    ];

    // Apply word swaps
    upgrades.forEach(item => {
        text = text.replace(item.find, item.replace);
    });

    // Clean up: standardize bullets and capitalize
    let lines = text.split('\n').filter(l => l.trim() !== '');
    lines = lines.map(line => {
        let cleanLine = line.trim();
        // Remove existing symbols at start of line
        cleanLine = cleanLine.replace(/^[•\-\*\s]+/, '');
        // Capitalize first letter
        if (cleanLine.length > 0) {
            cleanLine = cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1);
        }
        return '• ' + cleanLine;
    });

    commEl.value = lines.join('\n');
    
    // Visual feedback "Flash"
    commEl.style.backgroundColor = "#e8f5e9";
    setTimeout(() => { commEl.style.backgroundColor = "white"; }, 400);
}

function addTask() {
    const date = document.getElementById('taskDate').value;
    const mainTask = document.getElementById('taskMain').value;
    const comments = document.getElementById('taskComments').value;
    const duration = parseFloat(document.getElementById('taskDuration').value);

    if (!date || !mainTask || isNaN(duration)) {
        alert("Please fill in Date, Main Task, and Hours.");
        return;
    }

    const entry = { date, mainTask, comments, duration };

    if (editIndex !== null) {
        invoiceData.tasks[editIndex] = entry;
        editIndex = null;
        document.querySelector('.btn-add').innerText = "Add to Invoice";
        document.querySelector('.btn-add').style.background = "";
        document.getElementById('btn-cancel').style.display = "none";
    } else {
        invoiceData.tasks.push(entry);
    }

    // Always sort by date after adding
    invoiceData.tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    save();
    resetForm();
    render();
}

function editTask(index) {
    const t = invoiceData.tasks[index];
    document.getElementById('taskDate').value = t.date;
    document.getElementById('taskMain').value = t.mainTask;
    document.getElementById('taskComments').value = t.comments;
    document.getElementById('taskDuration').value = t.duration;
    
    editIndex = index;
    const btn = document.querySelector('.btn-add');
    btn.innerText = "Save Changes";
    btn.style.background = "#f39c12"; // Warning color
    document.getElementById('btn-cancel').style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editIndex = null;
    resetForm();
    const
