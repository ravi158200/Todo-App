const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const dateDisplay = document.getElementById('date-display');

const API_URL = '/api/tasks';

// Init
document.addEventListener('DOMContentLoaded', () => {
    setDate();
    fetchTasks();
});

// Set current date
function setDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const today = new Date();
    dateDisplay.innerText = today.toLocaleDateString('en-US', options);
}

// Fetch Tasks
async function fetchTasks() {
    try {
        const res = await fetch(API_URL);
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        list.innerHTML = `<li class="skeleton">Failed to load tasks. Verify backend is running.</li>`;
    }
}

// Render Tasks
function renderTasks(tasks) {
    list.innerHTML = '';
    
    if (tasks.length === 0) {
        list.innerHTML = `<li class="skeleton">No tasks yet. Create one!</li>`;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <button class="task-checkbox-btn" onclick="toggleCompleted('${task._id}', ${task.completed})">
                <i class="fas fa-check"></i>
            </button>
            <span class="task-text">${escapeHTML(task.title)}</span>
            <button class="delete-btn" onclick="deleteTask('${task._id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(li);
    });

    updateStats(tasks);
}

function updateStats(tasks) {
    const uncompleted = tasks.filter(t => !t.completed).length;
    taskCount.innerText = `${uncompleted} task${uncompleted !== 1 ? 's' : ''} left`;
}

// Add Task
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });
        
        if (res.ok) {
            input.value = '';
            fetchTasks();
        }
    } catch (err) {
        console.error('Error adding task:', err);
    }
});

// Toggle Completed
async function toggleCompleted(id, currentState) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !currentState })
        });
        
        if (res.ok) {
            fetchTasks();
        }
    } catch (err) {
        console.error('Error updating task:', err);
    }
}

// Delete Task
async function deleteTask(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            fetchTasks();
        }
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

// Utility to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
