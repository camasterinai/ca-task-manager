import { supabase } from './supabase-config.js';

// Sign up function
async function signUp(email, password, fullName, role) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });
  if (error) {
    console.error('Error signing up:', error.message);
    return { data, error };
  }
  // The user is already created, and the profile data is added via options.
  // Supabase triggers can be used to insert into a public.profiles table.
  return { data, error };
}

// Sign in function
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) console.error('Error signing in:', error.message);
  return { data, error };
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
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) console.error('Error updating password:', error.message);
  return { data, error };
}

async function fetchUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) console.error('Error fetching user profile:', error.message);
  return data;
}

async function updateUserProfile(fullName, department, phone) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').update({ full_name: fullName, department, phone }).eq('id', user.id);
  if (error) console.error('Error updating user profile:', error.message);
  return data;
}

export { signUp, signIn, signOut, resetPassword, updatePassword, fetchUserProfile, updateUserProfile };