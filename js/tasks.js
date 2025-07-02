import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('create-task-form');
    const tasksContainer = document.getElementById('tasks-container');
    const taskDetailModal = document.getElementById('task-detail-modal');
    const closeButton = document.querySelector('.close-button');
    const addCommentForm = document.getElementById('add-comment-form');
    let currentTaskId = null;

    if (taskForm) {
        populateUsers();
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const dueDate = document.getElementById('due_date').value;
            const priority = document.getElementById('priority').value;
            const category = document.getElementById('category').value;
            const assignee = document.getElementById('assignee').value;

            const { data, error } = await supabase.from('tasks').insert([
                { title, description, due_date: dueDate, priority, category, assigned_to: assignee, assigned_by: (await supabase.auth.getUser()).data.user.id }
            ]);

            if (error) {
                alert('Error creating task:' + error.message);
                console.error('Error creating task:', error.message);
            } else {
                window.location.href = 'tasks.html';
            }
        });
    }

    if (tasksContainer) {
        fetchTasks();

        supabase
            .channel('tasks')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
                fetchTasks();
            })
            .subscribe();

        supabase
            .channel('task_comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments' }, payload => {
                if (currentTaskId) {
                    fetchCommentsForTask(currentTaskId);
                }
            })
            .subscribe();
    }

    closeButton.addEventListener('click', () => {
        taskDetailModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == taskDetailModal) {
            taskDetailModal.style.display = 'none';
        }
    });

    addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentText = document.getElementById('comment-text').value;
        if (!commentText || !currentTaskId) return;

        const { data, error } = await supabase.from('task_comments').insert([
            { task_id: currentTaskId, user_id: (await supabase.auth.getUser()).data.user.id, comment: commentText }
        ]);

        if (error) {
            console.error('Error adding comment:', error.message);
        } else {
            document.getElementById('comment-text').value = '';
            fetchCommentsForTask(currentTaskId);
        }
    });
});

async function populateUsers() {
    const { data: users, error } = await supabase.from('profiles').select('id, full_name');
    if (error) {
        console.error('Error fetching users:', error.message);
        return;
    }

    const assigneeSelect = document.getElementById('assignee');
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.full_name;
        assigneeSelect.appendChild(option);
    });
}

async function fetchTasks() {
    const { data: tasks, error } = await supabase.from('tasks').select(`
        *,
        assignee:profiles!assigned_to(full_name),
        creator:profiles!assigned_by(full_name)
    `);

    if (error) {
        console.error('Error fetching tasks:', error.message);
        return;
    }

    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-card');
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p><strong>Due:</strong> ${task.due_date}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
            <p><strong>Category:</strong> ${task.category}</p>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Assigned to:</strong> ${task.assignee.full_name}</p>
            <p><strong>Assigned by:</strong> ${task.creator.full_name}</p>
        `;
        taskElement.addEventListener('click', () => openTaskDetailModal(task));
        tasksContainer.appendChild(taskElement);
    });
}

async function openTaskDetailModal(task) {
    currentTaskId = task.id;
    document.getElementById('modal-task-title').textContent = task.title;
    document.getElementById('modal-task-description').textContent = task.description;
    document.getElementById('modal-task-assignee').textContent = task.assignee.full_name;
    document.getElementById('modal-task-due-date').textContent = task.due_date;
    document.getElementById('modal-task-priority').textContent = task.priority;
    document.getElementById('modal-task-category').textContent = task.category;
    document.getElementById('modal-task-status').textContent = task.status;

    await fetchCommentsForTask(task.id);
    document.getElementById('task-detail-modal').style.display = 'block';
}

async function fetchCommentsForTask(taskId) {
    const { data: comments, error } = await supabase.from('task_comments').select(`
        *,
        profiles(full_name)
    `).eq('task_id', taskId).order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error.message);
        return;
    }

    const commentsContainer = document.getElementById('task-comments');
    commentsContainer.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment-item');
        commentElement.innerHTML = `
            <p><strong>${comment.profiles.full_name}</strong> (${new Date(comment.created_at).toLocaleString()}):</p>
            <p>${comment.comment}</p>
        `;
        commentsContainer.appendChild(commentElement);
    });
}