import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

// Supabase configuration
const supabaseUrl = 'https://jaicupcmdaypybsbbacz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaWN1cGNtZGF5cHlic2JiYWN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MzE4OTcsImV4cCI6MjA1OTMwNzg5N30.x4PDKEcqKhOlmY5B-9nBtewcB6voNG5SC0TJ2wQ1yQE';

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Set up auth state change listener to sync Firebase token with Supabase
  auth.onIdTokenChanged(async (user) => {
    if (user) {
      try {
        // Get the Firebase ID token
        const token = await user.getIdToken();
        
        // Try to sign in to Supabase with the Firebase token
        try {
          // Modern method (if available)
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'firebase',
            token,
          });
          
          if (error) {
            console.error('Supabase auth error:', error);
            // Fallback to manual token setting
            supabase.auth.setAuth(token);
          } else {
            console.log('Successfully authenticated with Supabase');
          }
        } catch (e) {
          // Fallback for older versions of supabase-js
          console.log('Using fallback auth method');
          supabase.auth.setAuth(token);
        }
      } catch (error) {
        console.error('Error getting Firebase token:', error);
      }
    } else {
      // Sign out from Supabase when Firebase signs out
      await supabase.auth.signOut();
    }
  });
  
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
    auth: {
      signOut: () => Promise.resolve(),
      setAuth: () => {}
    }
  };
}

export { supabase };
