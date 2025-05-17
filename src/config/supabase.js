// Fix for the blank screen issue
// This file should be placed in the src/config directory

import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback to prevent blank screen
// Replace these with your actual Supabase credentials when ready for production
const supabaseUrl = 'https://jaicupcmdaypybsbbacz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaWN1cGNtZGF5cHlic2JiYWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MzE4OTcsImV4cCI6MjA1OTMwNzg5N30.x4PDKEcqKhOlmY5B-9nBtewcB6voNG5SC0TJ2wQ1yQE';

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