import { supabase } from './supabase-config.js';
import { signOut } from './auth.js';
import { fetchNotifications, getUnreadNotificationCount, markNotificationAsRead } from './notifications.js';

document.addEventListener('DOMContentLoaded', async () => {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      await signOut();
      window.location.href = '../index.html';
    });
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    window.location.href = '../index.html'; // Redirect to login if not authenticated
    return;
  }

  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (error) {
    console.error('Error fetching profile:', error.message);
    return;
  }

  if (profile) {
    renderDashboard(profile.role);
    updateNotificationCount();
  }

  const notificationsLink = document.getElementById('notifications-link');
  if (notificationsLink) {
    notificationsLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await displayNotifications();
    });
  }

  const notificationModal = document.getElementById('notification-modal');
  const closeNotificationModal = document.querySelector('#notification-modal .close-button');

  if (closeNotificationModal) {
    closeNotificationModal.addEventListener('click', () => {
      notificationModal.style.display = 'none';
    });
  }

  window.addEventListener('click', (event) => {
    if (event.target == notificationModal) {
      notificationModal.style.display = 'none';
    }
  });
});

async function updateNotificationCount() {
  const count = await getUnreadNotificationCount();
  const notificationCountSpan = document.getElementById('notification-count');
  if (notificationCountSpan) {
    notificationCountSpan.textContent = count;
  }
}

async function displayNotifications() {
  const notifications = await fetchNotifications();
  const notificationList = document.getElementById('notification-list');
  const notificationModal = document.getElementById('notification-modal');

  if (!notificationList || !notificationModal) return;

  notificationList.innerHTML = '';
  if (notifications.length === 0) {
    notificationList.innerHTML = '<p>No new notifications.</p>';
  } else {
    notifications.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.classList.add('notification-item');
      if (!notification.read_status) {
        notificationItem.classList.add('unread');
      }
      notificationItem.innerHTML = `
        <p>${notification.message}</p>
        <span>${new Date(notification.created_at).toLocaleString()}</span>
      `;
      notificationItem.addEventListener('click', async () => {
        if (!notification.read_status) {
          await markNotificationAsRead(notification.id);
          updateNotificationCount();
          notificationItem.classList.remove('unread');
        }
      });
      notificationList.appendChild(notificationItem);
    });
  }
  notificationModal.style.display = 'block';
}

async function renderDashboard(role) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  let content = '';

  switch (role) {
    case 'admin':
      content = `
        <h2>Admin Overview</h2>
        <div id="admin-dashboard-content">
          <h3>All Tasks</h3>
          <div id="all-tasks-summary"></div>
          <h3>User Management</h3>
          <div id="user-list"></div>
        </div>
      `;
      mainContent.innerHTML += content;
      fetchAdminDashboardData();
      break;
    case 'senior':
      content = `
        <h2>Senior Accountant Overview</h2>
        <div id="senior-dashboard-content">
          <h3>My Team's Tasks</h3>
          <div id="team-tasks-summary"></div>
          <h3>Assign New Task</h3>
          <a href="../pages/create-task.html">Create Task</a>
        </div>
      `;
      mainContent.innerHTML += content;
      fetchSeniorDashboardData();
      break;
    case 'junior':
      content = `
        <h2>Junior Accountant Overview</h2>
        <div id="junior-dashboard-content">
          <h3>My Assigned Tasks</h3>
          <div id="my-tasks-list"></div>
        </div>
      `;
      mainContent.innerHTML += content;
      fetchJuniorDashboardData();
      break;
    case 'staff':
      content = `
        <h2>Support Staff Overview</h2>
        <div id="staff-dashboard-content">
          <h3>Administrative Tasks</h3>
          <div id="admin-tasks-list"></div>
        </div>
      `;
      mainContent.innerHTML += content;
      fetchStaffDashboardData();
      break;
    default:
      content = '<p>Welcome to your dashboard!</p>';
      mainContent.innerHTML += content;
      break;
  }
}

async function fetchAdminDashboardData() {
  const { data: tasks, error: tasksError } = await supabase.from('tasks').select('status');
  const { data: users, error: usersError } = await supabase.from('profiles').select('id, full_name, email, role');

  if (tasksError) console.error('Error fetching tasks for admin dashboard:', tasksError.message);
  if (usersError) console.error('Error fetching users for admin dashboard:', usersError.message);

  if (tasks) {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;

    document.getElementById('all-tasks-summary').innerHTML = `
      <p>Total Tasks: ${totalTasks}</p>
      <p>Pending: ${pendingTasks}</p>
      <p>In Progress: ${inProgressTasks}</p>
      <p>Completed: ${completedTasks}</p>
    `;
  }

  if (users) {
    const userListDiv = document.getElementById('user-list');
    let userHtml = '';
    users.forEach(user => {
      userHtml += `<li>${user.full_name} (${user.email}) - ${user.role}</li>`;
    });
    userListDiv.innerHTML = userHtml;
  }
}

async function fetchSeniorDashboardData() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data: teamTasks, error } = await supabase.from('tasks').select(`
    *,
    assignee:profiles!assigned_to(full_name),
    creator:profiles!assigned_by(full_name)
  `).eq('assigned_by', user.id); // Tasks assigned by this senior

  if (error) console.error('Error fetching senior dashboard tasks:', error.message);

  if (teamTasks) {
    const teamTasksSummaryDiv = document.getElementById('team-tasks-summary');
    let taskHtml = '';
    teamTasks.forEach(task => {
      taskHtml += `
        <div class="task-card">
          <h3>${task.title}</h3>
          <p><strong>Assigned To:</strong> ${task.assignee.full_name}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${task.due_date}</p>
        </div>
      `;
    });
    teamTasksSummaryDiv.innerHTML = taskHtml;
  }
}

async function fetchJuniorDashboardData() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data: myTasks, error } = await supabase.from('tasks').select(`
    *,
    assignee:profiles!assigned_to(full_name),
    creator:profiles!assigned_by(full_name)
  `).eq('assigned_to', user.id);

  if (error) console.error('Error fetching junior dashboard tasks:', error.message);

  if (myTasks) {
    const myTasksListDiv = document.getElementById('my-tasks-list');
    let taskHtml = '';
    myTasks.forEach(task => {
      taskHtml += `
        <div class="task-card">
          <h3>${task.title}</h3>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${task.due_date}</p>
          <button onclick="updateTaskStatus('${task.id}', 'completed')">Mark as Completed</button>
        </div>
      `;
    });
    myTasksListDiv.innerHTML = taskHtml;
  }
}

async function fetchStaffDashboardData() {
  const { data: adminTasks, error } = await supabase.from('tasks').select(`
    *,
    assignee:profiles!assigned_to(full_name),
    creator:profiles!assigned_by(full_name)
  `).eq('category', 'administrative');

  if (error) console.error('Error fetching staff dashboard tasks:', error.message);

  if (adminTasks) {
    const adminTasksListDiv = document.getElementById('admin-tasks-list');
    let taskHtml = '';
    adminTasks.forEach(task => {
      taskHtml += `
        <div class="task-card">
          <h3>${task.title}</h3>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Due:</strong> ${task.due_date}</p>
          <button onclick="updateTaskStatus('${task.id}', 'completed')">Mark as Completed</button>
        </div>
      `;
    });
    adminTasksListDiv.innerHTML = taskHtml;
  }
}

window.updateTaskStatus = async (taskId, newStatus) => {
  const { data, error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
  if (error) {
    console.error('Error updating task status:', error.message);
  } else {
    alert('Task status updated!');
    // Re-fetch tasks to update the dashboard
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) {
        renderDashboard(profile.role);
      }
    }
  }
};