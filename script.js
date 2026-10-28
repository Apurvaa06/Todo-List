document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const taskInput = document.getElementById('taskInput');
    const taskDueDate = document.getElementById('taskDueDate');
    const highPriorityCheck = document.getElementById('highPriorityCheck');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearDoneBtn = document.getElementById('clearDoneBtn');
    
    // Header & Sidebar
    const themeToggle = document.getElementById('themeToggle');

    // DOM Elements for Charts & Stats
    const openTasksCount = document.getElementById('openTasksCount');
    const overdueCount = document.getElementById('overdueCount');
    const doneCount = document.getElementById('doneCount');
    const totalCount = document.getElementById('totalCount');
    const topProgressBar = document.getElementById('topProgressBar');
    const resolvedCount = document.getElementById('resolvedCount');
    const resolvedPercent = document.getElementById('resolvedPercent');
    const totalTasksPill = document.getElementById('totalTasksPill');
    const pieChartCircle = document.getElementById('pieChartCircle');
    const pieChartPercent = document.getElementById('pieChartPercent');
    const hpCount = document.getElementById('hpCount');
    const hpPercent = document.getElementById('hpPercent');
    const activityScore = document.getElementById('activityScore');
    const barLabel = document.getElementById('barLabel');
    const todayDate = document.getElementById('todayDate');
    const dotMatrix = document.getElementById('dotMatrix');
    const barChartBars = document.querySelectorAll('#barChart .bar');
    const triangleChart = document.getElementById('triangleChart');

    // State
    let tasks = JSON.parse(localStorage.getItem('bento_tasks_v3')) || [];
    let draggedTaskIndex = null;

    // Toast Notification System
    const showToast = (message, type = 'info') => {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-bell';
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <div class="toast-content">
                <h4>Reminder</h4>
                <p>${message}</p>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 50);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); 
        }, 4000);
    };

    // Check for alerts on startup
    const runStartupAlerts = () => {
        const overdueTasks = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;
        const pendingTasks = tasks.filter(t => !t.completed).length;

        if (overdueTasks > 0) {
            showToast(`You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''} that need immediate attention!`, 'warning');
        } else if (pendingTasks > 0) {
            showToast(`You have ${pendingTasks} task${pendingTasks > 1 ? 's' : ''} left to complete. You've got this!`, 'info');
        } else if (tasks.length > 0) {
            showToast(`All caught up! Excellent work.`, 'info');
        }
    };

    // Set today's date
    const options = { month: 'short', day: 'numeric' };
    todayDate.textContent = new Date().toLocaleDateString('en-US', options);

    // Initialize Theme
    const isDark = localStorage.getItem('bento_dark_mode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-theme');
        themeToggle.className = 'fas fa-sun';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const dark = document.body.classList.contains('dark-theme');
        localStorage.setItem('bento_dark_mode', dark);
        themeToggle.className = dark ? 'fas fa-sun' : 'far fa-moon';
    });

    const initDotMatrix = () => {
        dotMatrix.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot dark';
            dotMatrix.appendChild(dot);
        }
    };
    initDotMatrix();

    const saveTasks = () => {
        localStorage.setItem('bento_tasks_v3', JSON.stringify(tasks));
        updateDashboard();
    };

    const isOverdue = (dateString) => {
        if (!dateString) return false;
        const due = new Date(dateString);
        due.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return due < today;
    };

    const updateDashboard = () => {
        const total = tasks.length;
        const done = tasks.filter(t => t.completed).length;
        const open = total - done;
        
        const overdue = tasks.filter(t => !t.completed && isOverdue(t.dueDate)).length;
        const totalHp = tasks.filter(t => t.highPriority).length;
        
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);
        const hpPercentage = total === 0 ? 0 : Math.round((totalHp / total) * 100);

        openTasksCount.textContent = open;
        overdueCount.textContent = `${overdue} Overdue`;
        
        // Alert styling for overdue
        if (overdue > 0) {
            overdueCount.style.color = '#e74c3c';
            overdueCount.classList.add('pulse-alert');
        } else {
            overdueCount.style.color = 'var(--orange)';
            overdueCount.classList.remove('pulse-alert');
        }

        doneCount.textContent = done;
        totalCount.textContent = total;
        totalTasksPill.textContent = total;
        resolvedCount.textContent = done;
        resolvedPercent.textContent = `+${percent}%`;
        
        topProgressBar.style.width = `${percent}%`;

        pieChartPercent.textContent = `${percent}%`;
        pieChartCircle.setAttribute('stroke-dasharray', `${percent}, 100`);

        hpCount.textContent = totalHp;
        hpPercent.textContent = `${hpPercentage}%`;
        
        const triangles = triangleChart.children;
        Array.from(triangles).forEach(t => {
            t.classList.remove('orange');
            t.classList.add('dark');
        });
        if (totalHp > 0) {
            triangles[2].classList.remove('dark');
            triangles[2].classList.add('orange');
        }
        if (totalHp > 2) {
            triangles[0].classList.remove('dark');
            triangles[0].classList.add('orange');
        }

        const dots = dotMatrix.children;
        for (let i = 0; i < 20; i++) {
            if (i < done) {
                dots[i].classList.remove('dark');
                dots[i].classList.add('orange');
            } else {
                dots[i].classList.remove('orange');
                dots[i].classList.add('dark');
            }
        }

        activityScore.textContent = `${percent}%`;
        barLabel.textContent = `${percent}%`;
        
        if(barChartBars.length >= 3) {
            const h = Math.max(10, percent);
            barChartBars[2].style.height = `${h}%`;
            barChartBars[0].style.height = `${total === 0 ? 20 : Math.floor(Math.random() * 40) + 10}%`;
            barChartBars[1].style.height = `${total === 0 ? 40 : Math.floor(Math.random() * 50) + 20}%`;
            barChartBars[3].style.height = `${total === 0 ? 30 : Math.floor(Math.random() * 40) + 10}%`;
            barChartBars[4].style.height = `${total === 0 ? 50 : Math.floor(Math.random() * 60) + 20}%`;
        }
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `dash-task-item ${task.completed ? 'done' : ''} ${task.highPriority ? 'high-priority' : ''}`;
            li.draggable = true;
            
            li.addEventListener('dragstart', (e) => {
                draggedTaskIndex = index;
                setTimeout(() => li.classList.add('dragging'), 0);
            });
            li.addEventListener('dragend', () => {
                li.classList.remove('dragging');
                draggedTaskIndex = null;
            });
            li.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            li.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedTaskIndex !== null && draggedTaskIndex !== index) {
                    const itemToMove = tasks.splice(draggedTaskIndex, 1)[0];
                    tasks.splice(index, 0, itemToMove);
                    saveTasks();
                    renderTasks();
                }
            });

            const contentDiv = document.createElement('div');
            contentDiv.className = 'content';
            contentDiv.addEventListener('click', () => toggleTask(index));

            const primaryDiv = document.createElement('div');
            primaryDiv.className = 'task-primary';
            
            const check = document.createElement('div');
            check.className = 'dash-check';
            check.innerHTML = '<i class="fas fa-check"></i>';

            const text = document.createElement('span');
            text.className = 'task-text';
            text.textContent = task.text;
            
            primaryDiv.appendChild(check);
            primaryDiv.appendChild(text);
            contentDiv.appendChild(primaryDiv);

            const metaDiv = document.createElement('div');
            metaDiv.className = 'task-meta';

            if (task.dueDate) {
                const dateSpan = document.createElement('span');
                dateSpan.className = 'meta-tag';
                const overdue = !task.completed && isOverdue(task.dueDate);
                if (overdue) dateSpan.classList.add('overdue');
                
                const d = new Date(task.dueDate);
                const offsetDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
                dateSpan.innerHTML = `<i class="far fa-calendar-alt"></i> ${offsetDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}`;
                metaDiv.appendChild(dateSpan);
            }
            
            if (metaDiv.children.length > 0) {
                contentDiv.appendChild(metaDiv);
            }

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'dash-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'dash-action-btn edit';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startEdit(index, text);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'dash-action-btn delete';
            delBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(index);
            });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(delBtn);

            li.appendChild(contentDiv);
            li.appendChild(actionsDiv);

            taskList.appendChild(li);
        });

        updateDashboard();
    };

    const startEdit = (index, textSpan) => {
        const currentText = tasks[index].text;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentText;

        textSpan.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                tasks[index].text = newText;
                saveTasks();
            }
            renderTasks();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    };

    const addTask = () => {
        const text = taskInput.value.trim();
        const date = taskDueDate.value;
        const isHighPriority = highPriorityCheck.checked;
        
        if (text) {
            tasks.unshift({ 
                id: Date.now().toString(),
                text, 
                completed: false, 
                highPriority: isHighPriority,
                dueDate: date
            });
            taskInput.value = '';
            taskDueDate.value = '';
            highPriorityCheck.checked = false;
            saveTasks();
            renderTasks();
            
            if (date && isOverdue(date)) {
                showToast("You just added a task that is already overdue!", "warning");
            }
        }
    };

    const toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
        
        if (tasks[index].completed) {
            const pendingTasks = tasks.filter(t => !t.completed).length;
            if (pendingTasks === 0) {
                showToast("Amazing! You've completed all your tasks.", "info");
            }
        }
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    const clearDone = () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    };

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    clearDoneBtn.addEventListener('click', clearDone);

    renderTasks();
    
    setTimeout(runStartupAlerts, 1000);
});
