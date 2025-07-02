// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const { createClient } = supabase
const supabase = createClient(_supabase.supabaseUrl, _supabase.supabaseKey)

// Export for use in other files
export { supabase };