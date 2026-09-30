const API_URL = 'https://task-tracker-jw9e.onrender.com';
let isLoginView = true;
let allTasks = [];


const heroSection = document.getElementById('hero-section');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const toggleAuth = document.getElementById('toggle-auth');
const nameGroup = document.getElementById('name-group');
const searchInput = document.getElementById('search-input');
const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');


const navLoginBtn = document.getElementById('nav-login-btn');
const navRegisterBtn = document.getElementById('nav-register-btn');
const heroLoginBtn = document.getElementById('hero-login-btn');
const heroRegisterBtn = document.getElementById('hero-register-btn');


function showLogin() {
    isLoginView = true;
    if (heroSection) heroSection.style.display = 'none';
    if (authContainer) authContainer.style.display = 'block';
    if (appContainer) appContainer.style.display = 'none';
    if (authTitle) authTitle.innerText = 'Login';
    if (authBtn) authBtn.innerText = 'Login';
    if (nameGroup) nameGroup.style.display = 'none';
    if (toggleAuth) toggleAuth.innerHTML = "Don't have an account? <span>Register</span>";
}


function showRegister() {
    isLoginView = false;
    if (heroSection) heroSection.style.display = 'none';
    if (authContainer) authContainer.style.display = 'block';
    if (appContainer) appContainer.style.display = 'none';
    if (authTitle) authTitle.innerText = 'Register';
    if (authBtn) authBtn.innerText = 'Register';
    if (nameGroup) nameGroup.style.display = 'block';
    if (toggleAuth) toggleAuth.innerHTML = "Already have an account? <span>Login</span>";
}


if (navLoginBtn) navLoginBtn.addEventListener('click', showLogin);
if (heroLoginBtn) heroLoginBtn.addEventListener('click', showLogin);
if (navRegisterBtn) navRegisterBtn.addEventListener('click', showRegister);
if (heroRegisterBtn) heroRegisterBtn.addEventListener('click', showRegister);


if (toggleAuth) {
    toggleAuth.addEventListener('click', () => {
        if (isLoginView) {
            showRegister();
        } else {
            showLogin();
        }
    });
}


if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name') ? document.getElementById('name').value : '';

        const endpoint = isLoginView ? '/login' : '/register';
        const bodyData = isLoginView ? { email, password } : { name, email, password };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const data = await res.json();

            if (res.ok) {
                if (!isLoginView) {
                    alert('Registration successful! Please login.');
                    showLogin();
                } else {
                    
                    if (heroSection) heroSection.style.display = 'none';
                    if (authContainer) authContainer.style.display = 'none';
                    if (appContainer) appContainer.style.display = 'block';
                    fetchTasks();
                }
            } else {
                alert(data.error || 'Authentication failed');
            }
        } catch (err) {
            console.error('Auth error:', err);
        }
    });
}


if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
}


async function fetchTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`);
        allTasks = await res.json();
        renderTasks(allTasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
    }
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    taskList.innerHTML = '';
    taskList.style.listStyle = 'none';
    taskList.style.padding = '0';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '10px';
        li.style.marginTop = '8px';
        li.style.background = 'rgba(255,255,255,0.08)';
        li.style.borderRadius = '6px';

        const currentStatus = task.status || 'Pending';

        li.innerHTML = `
            <span style="font-weight: 500; color: #fff;">${task.task}</span>
            <div style="display: flex; gap: 8px; align-items: center;">
                <select onchange="updateStatus(${task.id}, this.value)" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc; font-size: 13px;">
                    <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button onclick="editTask(${task.id}, '${task.task}')" style="background: #ffc107; color: black; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Edit</button>
                <button onclick="deleteTask(${task.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('task-title');
        if (!input) return;

        const taskValue = input.value.trim();
        if (!taskValue) return;

        try {
            await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: taskValue })
            });
            input.value = '';
            fetchTasks();
        } catch (err) {
            console.error('Error adding task:', err);
        }
    });
}

async function updateStatus(id, newStatus) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchTasks();
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

async function editTask(id, currentTask) {
    const newTask = prompt('Update your task:', currentTask);
    if (newTask === null || newTask.trim() === '') return;

    try {
        await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: newTask.trim() })
        });
        fetchTasks();
    } catch (err) {
        console.error('Error updating task:', err);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
        fetchTasks();
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredTasks = allTasks.filter(t => t.task.toLowerCase().includes(searchTerm));
        renderTasks(filteredTasks);
    });
}