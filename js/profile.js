import { supabase } from './supabase-config.js';
import { fetchUserProfile, updateUserProfile } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profile-form');
    const fullNameInput = document.getElementById('full_name');
    const emailInput = document.getElementById('email');
    const roleInput = document.getElementById('role');
    const departmentInput = document.getElementById('department');
    const phoneInput = document.getElementById('phone');
    const messageElement = document.getElementById('profile-message');

    const userProfile = await fetchUserProfile();

    if (userProfile) {
        fullNameInput.value = userProfile.full_name;
        emailInput.value = userProfile.email;
        roleInput.value = userProfile.role;
        departmentInput.value = userProfile.department || '';
        phoneInput.value = userProfile.phone || '';
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = fullNameInput.value;
        const department = departmentInput.value;
        const phone = phoneInput.value;

        const { data, error } = await updateUserProfile(fullName, department, phone);

        if (error) {
            messageElement.textContent = 'Error updating profile: ' + error.message;
            messageElement.style.color = 'red';
        } else {
            messageElement.textContent = 'Profile updated successfully!';
            messageElement.style.color = 'green';
        }
    });
});