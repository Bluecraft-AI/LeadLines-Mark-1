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
      
      // Create user profile in Supabase
      try {
        await supabase.from('profiles').insert({
          user_id: user.uid,
          name: 'John Doe',
          email: user.email,
          company: 'Acme Corporation',
          role: 'Hiring Manager',
          phone: '(555) 123-4567',
          notifications: {
            email: true,
            browser: false,
            mobile: true
          },
          created_at: new Date(),
          updated_at: new Date()
        });
      } catch (error) {
        console.error("Error creating user profile in Supabase:", error);
        // Continue even if Supabase profile creation fails
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
