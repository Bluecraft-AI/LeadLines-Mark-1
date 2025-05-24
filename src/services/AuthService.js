import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

/**
 * Service for handling authentication between Firebase and Supabase
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.authStateChangeListeners = [];
    
    // Set up Firebase auth state listener
    auth.onAuthStateChanged(this.handleAuthStateChange.bind(this));
  }

  /**
   * Handle Firebase auth state changes and sync with Supabase
   * @param {Object} user - Firebase user object
   */
  async handleAuthStateChange(user) {
    try {
      if (user) {
        // User is signed in
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Sync with Supabase by getting a Firebase ID token and signing in to Supabase
        await this.syncSupabaseAuth();
      } else {
        // User is signed out
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Sign out from Supabase
        await supabase.auth.signOut();
      }
      
      // Notify listeners
      this.notifyAuthStateChangeListeners();
    } catch (error) {
      console.error('Auth state change error:', error);
    }
  }

  /**
   * Synchronize Firebase authentication with Supabase
   */
  async syncSupabaseAuth() {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Get the Firebase ID token
      const idToken = await this.currentUser.getIdToken();
      
      // Sign in to Supabase with the Firebase token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'firebase',
        token: idToken,
      });
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      console.log('Successfully authenticated with Supabase');
      return data;
    } catch (error) {
      console.error('Error syncing Supabase auth:', error);
      
      // Fallback method if signInWithIdToken is not available or fails
      try {
        // Get the Firebase ID token
        const idToken = await this.currentUser.getIdToken();
        
        // Set the auth header manually
        supabase.auth.setAuth(idToken);
        console.log('Set Supabase auth header manually');
      } catch (fallbackError) {
        console.error('Fallback auth method failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * Force refresh the authentication state
   */
  async refreshAuth() {
    try {
      if (this.currentUser) {
        await this.syncSupabaseAuth();
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
      throw error;
    }
  }

  /**
   * Get the current user ID (Firebase UID)
   * @returns {string|null} The current user ID or null if not authenticated
   */
  getCurrentUserId() {
    return this.currentUser?.uid || null;
  }

  /**
   * Get the current user email
   * @returns {string|null} The current user email or null if not authenticated
   */
  getCurrentUserEmail() {
    return this.currentUser?.email || null;
  }

  /**
   * Check if a user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Add a listener for auth state changes
   * @param {Function} listener - The listener function
   */
  addAuthStateChangeListener(listener) {
    if (typeof listener === 'function') {
      this.authStateChangeListeners.push(listener);
    }
  }

  /**
   * Remove a listener for auth state changes
   * @param {Function} listener - The listener function to remove
   */
  removeAuthStateChangeListener(listener) {
    this.authStateChangeListeners = this.authStateChangeListeners.filter(
      (l) => l !== listener
    );
  }

  /**
   * Notify all auth state change listeners
   */
  notifyAuthStateChangeListeners() {
    this.authStateChangeListeners.forEach((listener) => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Error in auth state change listener:', error);
      }
    });
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService; 