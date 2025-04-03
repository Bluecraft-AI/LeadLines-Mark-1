import { createClient } from '@supabase/supabase-js';

// Supabase configuration for app and user info
// Replace with your actual Supabase URL and anon key when implementing
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase }; 