import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://cegmsijyxjnpapjpdyzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZ21zaWp5eGpucGFwanBkeXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Mzc4NzQsImV4cCI6MjA2NzAxMzg3NH0.N2GBZewzJUW15xe2tMDjlRNLdtxlbO_O1OESBzEpRe4';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
export { supabase };