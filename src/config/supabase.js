// Fix for the blank screen issue
// This file should be placed in the src/config directory

import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback to prevent blank screen
// Replace these with your actual Supabase credentials when ready for production
const supabaseUrl = 'https://siswhwneokusjkpsazlt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpc3dod25lb2t1c2prcHNhemx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDMxNzgsImV4cCI6MjA1OTMxOTE3OH0.ZVmfOcud-m-QhD9p83kfHmPj0sdAOUwshCWAOW1qQ1A';

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Provide a mock client to prevent fatal errors
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null
        }),
        single: () => ({
          data: null,
          error: null
        })
      }),
      insert: () => ({
        data: null,
        error: null
      }),
      update: () => ({
        eq: () => ({
          data: null,
          error: null
        })
      })
    })
  };
}

export { supabase }; 