import { signIn } from './auth.js';
import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // The user object is nested in the data property
            const { data, error } = await signIn(email, password);

            if (error) {
                alert(error.message);
                return;
            }

            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError.message);
                    alert('Error fetching user profile. Please try again.');
                    return;
                }

                if (profile) {
                    // Use absolute paths for navigation
                    switch (profile.role) {
                        case 'admin':
                            window.location.href = '/dashboard/admin.html';
                            break;
                        case 'senior':
                            window.location.href = '/dashboard/senior.html';
                            break;
                        case 'junior':
                            window.location.href = '/dashboard/junior.html';
                            break;
                        case 'staff':
                            window.location.href = '/dashboard/staff.html';
                            break;
                        default:
                            window.location.href = '/index.html';
                    }
                }
            }
        });
    }
});
