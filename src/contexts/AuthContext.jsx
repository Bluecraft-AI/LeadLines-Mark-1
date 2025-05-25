import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { supabase } from '../config/supabase';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState({});

  // Sign up function
  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Initialize user settings
      const initialSettings = {
        integrations: {
          instantly: {
            apiKey: '',
            isConnected: false
          }
        }
      };
      
      // Store settings in localStorage
      localStorage.setItem(`user_settings_${user.uid}`, JSON.stringify({
        [user.uid]: initialSettings
      }));
      
      // Update state
      setUserSettings({
        [user.uid]: initialSettings
      });
      
      // Create user record in Supabase users table
      try {
        await supabase.from('users').insert({
          firebase_uid: user.uid,
          email: user.email,
          full_name: 'New User',
          company: 'Your Company',
          role: 'Your Role'
        });
        
        // Create user settings record in Supabase user_settings table
        await supabase.from('user_settings').insert({
          firebase_uid: user.uid,
          notifications: {
            email: true,
            browser: false,
            mobile: true
          },
          integrations: initialSettings.integrations
        });
      } catch (error) {
        console.error("Error creating user records in Supabase:", error);
        // Continue even if Supabase record creation fails
      }
      
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Load user settings from localStorage
      const savedSettings = localStorage.getItem(`user_settings_${user.uid}`);
      if (savedSettings) {
        setUserSettings(JSON.parse(savedSettings));
      } else {
        // Initialize settings if not found
        const initialSettings = {
          [user.uid]: {
            integrations: {
              instantly: {
                apiKey: '',
                isConnected: false
              }
            }
          }
        };
        setUserSettings(initialSettings);
        localStorage.setItem(`user_settings_${user.uid}`, JSON.stringify(initialSettings));
      }
      
      // Check if user exists in Supabase, create if not
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', user.uid)
          .single();
        
        if (error && error.code === 'PGRST116') {
          // User doesn't exist in Supabase, create records
          await supabase.from('users').insert({
            firebase_uid: user.uid,
            email: user.email,
            full_name: 'New User',
            company: 'Your Company',
            role: 'Your Role'
          });
          
          await supabase.from('user_settings').insert({
            firebase_uid: user.uid,
            notifications: {
              email: true,
              browser: false,
              mobile: true
            },
            integrations: {
              instantly: {
                apiKey: '',
                isConnected: false
              }
            }
          });
        }
      } catch (error) {
        console.error("Error checking/creating user in Supabase:", error);
      }
      
      return user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserSettings({});
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Update password function
  const updatePassword = async (currentPassword, newPassword) => {
    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await firebaseUpdatePassword(currentUser, newPassword);
      
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  // Update user settings
  const updateUserSettings = (settings) => {
    if (!currentUser) return;
    
    const updatedSettings = {
      ...userSettings,
      [currentUser.uid]: settings
    };
    
    setUserSettings(updatedSettings);
    localStorage.setItem(`user_settings_${currentUser.uid}`, JSON.stringify(updatedSettings));
    
    // Also update Supabase user_settings
    try {
      supabase
        .from('user_settings')
        .update({
          integrations: settings.integrations,
          updated_at: new Date()
        })
        .eq('firebase_uid', currentUser.uid)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating user settings in Supabase:", error);
          }
        });
    } catch (error) {
      console.error("Error in updateUserSettings:", error);
    }
  };

  // Get current user settings
  const getUserSettings = () => {
    if (!currentUser || !userSettings[currentUser.uid]) return null;
    return userSettings[currentUser.uid];
  };

  // Effect for initializing auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // Load user settings from localStorage if user is logged in
        const savedSettings = localStorage.getItem(`user_settings_${user.uid}`);
        if (savedSettings) {
          setUserSettings(JSON.parse(savedSettings));
        }
        
        // Sync with Supabase user_settings
        supabase
          .from('user_settings')
          .select('*')
          .eq('firebase_uid', user.uid)
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              // Update local settings with Supabase data
              const currentLocalSettings = userSettings[user.uid] || {};
              const updatedSettings = {
                ...userSettings,
                [user.uid]: {
                  ...currentLocalSettings,
                  integrations: data.integrations || currentLocalSettings.integrations
                }
              };
              
              setUserSettings(updatedSettings);
              localStorage.setItem(`user_settings_${user.uid}`, JSON.stringify(updatedSettings));
            }
          });
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    signup,
    login,
    logout,
    updatePassword,
    loading,
    updateUserSettings,
    getUserSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
