import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const reportTypeSelect = document.getElementById('report-type');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportOutput = document.getElementById('report-output');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');

    generateReportBtn.addEventListener('click', generateReport);
    exportPdfBtn.addEventListener('click', exportReportToPdf);
    exportExcelBtn.addEventListener('click', exportReportToExcel);

    async function generateReport() {
        const reportType = reportTypeSelect.value;
        reportOutput.innerHTML = '';

        let data;
        let title = '';

        switch (reportType) {
            case 'individual-performance':
                title = 'Individual Performance Report';
                // Fetch tasks for current user or selected user
                const { data: tasks, error } = await supabase.from('tasks').select('*').eq('assigned_to', (await supabase.auth.getUser()).data.user.id);
                if (error) console.error('Error fetching tasks:', error.message);
                data = tasks;
                // Process data for individual performance
                reportOutput.innerHTML = `<h2>${title}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
                break;
            case 'team-productivity':
                title = 'Team Productivity Report';
                // Fetch all tasks and profiles
                const { data: allTasks, error: tasksError } = await supabase.from('tasks').select('*');
                const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name, role');
                if (tasksError) console.error('Error fetching tasks:', tasksError.message);
                if (profilesError) console.error('Error fetching profiles:', profilesError.message);
                data = { allTasks, profiles };
                // Process data for team productivity
                reportOutput.innerHTML = `<h2>${title}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
                break;
            case 'task-completion-statistics':
                title = 'Task Completion Statistics';
                const { data: stats, error: statsError } = await supabase.from('tasks').select('status', { count: 'exact' });
                if (statsError) console.error('Error fetching stats:', statsError.message);
                data = stats;
                // Process data for task completion statistics
                reportOutput.innerHTML = `<h2>${title}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
                break;
            case 'overdue-tasks':
                title = 'Overdue Tasks Report';
                const { data: overdue, error: overdueError } = await supabase.from('tasks').select('*').lt('due_date', new Date().toISOString()).neq('status', 'completed');
                if (overdueError) console.error('Error fetching overdue tasks:', overdueError.message);
                data = overdue;
                // Process data for overdue tasks
                reportOutput.innerHTML = `<h2>${title}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
                break;
            case 'weekly-monthly-summary':
                title = 'Weekly/Monthly Progress Summary';
                // Implement logic to filter tasks by week/month
                const { data: summary, error: summaryError } = await supabase.from('tasks').select('*').gte('created_at', new Date(new Date().setDate(new Date().getDate() - 7)).toISOString()); // Last 7 days
                if (summaryError) console.error('Error fetching summary:', summaryError.message);
                data = summary;
                // Process data for weekly/monthly summary
                reportOutput.innerHTML = `<h2>${title}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
                break;
            default:
                reportOutput.innerHTML = '<p>Select a report type.</p>';
                break;
        }
    }

    function exportReportToPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(document.querySelector('#report-output h2').textContent, 10, 10);
        doc.text(document.querySelector('#report-output pre').textContent, 10, 20);
        doc.save('report.pdf');
    }

    function exportReportToExcel() {
        const data = JSON.parse(document.querySelector('#report-output pre').textContent);
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, "report.xlsx");
    }
});