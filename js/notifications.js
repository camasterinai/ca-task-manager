import { supabase } from './supabase-config.js';

async function fetchNotifications() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return [];

    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching notifications:', error.message);
        return [];
    }
    return data;
}

async function markNotificationAsRead(notificationId) {
    const { data, error } = await supabase.from('notifications').update({ read_status: true }).eq('id', notificationId);
    if (error) {
        console.error('Error marking notification as read:', error.message);
    }
    return data;
}

async function getUnreadNotificationCount() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return 0;

    const { count, error } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read_status', false);
    if (error) {
        console.error('Error fetching unread notification count:', error.message);
        return 0;
    }
    return count;
}

export { fetchNotifications, markNotificationAsRead, getUnreadNotificationCount };