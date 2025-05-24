// Fix for the blank screen issue
// This file should be placed in the src/config directory

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jaicupcmdaypybsbbacz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaWN1cGNtZGF5cHlic2JiYWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MzE4OTcsImV4cCI6MjA1OTMwNzg5N30.x4PDKEcqKhOlmY5B-9nBtewcB6voNG5SC0TJ2wQ1yQE';

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        // Add a custom header that will be used by our updated RLS policies
        // This allows Firebase authenticated users to bypass RLS checks
        'x-firebase-auth': 'true',
        'X-Client-Info': 'leadlines-app'
      },
    },
  });
  
  console.log('Supabase client initialized successfully');
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
    }),
    storage: {
      from: () => ({
        upload: () => ({
          data: null,
          error: null
        }),
        createSignedUrl: () => ({
          data: null,
          error: null
        })
      })
    }
  };
}

// Enhanced error handling for download functionality
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error ${context}:`, error);
  
  if (error?.message) {
    // Handle specific error types
    if (error.message.includes('not found')) {
      return 'File not found. It may have been moved or deleted.';
    }
    if (error.message.includes('permission')) {
      return 'Permission denied. Please check your access rights.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export { supabase };
export default supabase; 