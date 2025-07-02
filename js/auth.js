import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const { user, error } = await signIn(email, password);
            if (error) {
                alert(error.message);
                return;
            }
            if (user) {
                const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profileError) {
                    console.error('Error fetching profile:', profileError.message);
                    alert('Error fetching user profile. Please try again.');
                    return;
                }
                if (profile) {
                    switch (profile.role) {
                        case 'admin':
                            window.location.href = '../dashboard/admin.html';
                            break;
                        case 'senior':
                            window.location.href = '../dashboard/senior.html';
                            break;
                        case 'junior':
                            window.location.href = '../dashboard/junior.html';
                            break;
                        case 'staff':
                            window.location.href = '../dashboard/staff.html';
                            break;
                        default:
                            window.location.href = '../index.html';
                    }
                }
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('full_name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const { user, error } = await signUp(email, password, fullName, role);
            if (error) {
                alert(error.message);
                return;
            }
            if (user) {
                const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                if (profileError) {
                    console.error('Error fetching profile:', profileError.message);
                    alert('Error fetching user profile. Please try again.');
                    return;
                }
                if (profile) {
                    switch (profile.role) {
                        case 'admin':
                            window.location.href = '../dashboard/admin.html';
                            break;
                        case 'senior':
                            window.location.href = '../dashboard/senior.html';
                            break;
                        case 'junior':
                            window.location.href = '../dashboard/junior.html';
                            break;
                        case 'staff':
                            window.location.href = '../dashboard/staff.html';
                            break;
                        default:
                            window.location.href = '../index.html';
                    }
                }
            }
            const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const { error } = await resetPassword(email);
            const messageElement = document.getElementById('message');
            if (error) {
                messageElement.textContent = 'Error: ' + error.message;
                messageElement.style.color = 'red';
            } else {
                messageElement.textContent = 'Password reset link sent to your email!';
                messageElement.style.color = 'green';
            }
        });
    }

    const updatePasswordForm = document.getElementById('update-password-form');
    if (updatePasswordForm) {
        updatePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const messageElement = document.getElementById('message');

            if (newPassword !== confirmPassword) {
                messageElement.textContent = 'Passwords do not match!';
                messageElement.style.color = 'red';
                return;
            }

            if (newPassword.length < 6) {
                messageElement.textContent = 'Password must be at least 6 characters long.';
                messageElement.style.color = 'red';
                return;
            }

            const { user, error } = await updatePassword(newPassword);
            if (error) {
                messageElement.textContent = 'Error: ' + error.message;
                messageElement.style.color = 'red';
            } else {
                messageElement.textContent = 'Password updated successfully!';
                messageElement.style.color = 'green';
                // Optionally redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    }
});

// Sign up function
async function signUp(email, password, fullName, role) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.error('Error signing up:', error.message);
    return { user, error };
  }
  // Insert into profiles table
  const { data: profile, error: profileError } = await supabase.from('profiles').insert([
    { id: user.id, full_name: fullName, email: email, role: role }
  ]);
  if (profileError) {
    console.error('Error inserting profile:', profileError.message);
    return { user: null, error: profileError };
  }
  return { user, error: null };
}

// Sign in function
async function signIn(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) console.error('Error signing in:', error.message);
  return { user, error };
}

// Sign out function
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error.message);
}

async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/pages/update-password.html',
  });
  if (error) console.error('Error sending password reset email:', error.message);
  return { error };
}

async function updatePassword(newPassword) {
  const { user, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) console.error('Error updating password:', error.message);
  return { user, error };
}

async function fetchUserProfile() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) console.error('Error fetching user profile:', error.message);
  return data;
}

async function updateUserProfile(fullName, department, phone) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').update({ full_name: fullName, department, phone }).eq('id', user.id);
  if (error) console.error('Error updating user profile:', error.message);
  return data;
}

export { signUp, signIn, signOut, resetPassword, updatePassword, fetchUserProfile, updateUserProfile };