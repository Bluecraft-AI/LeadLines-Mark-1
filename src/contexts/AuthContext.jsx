import React, { createContext, useState, useContext, useEffect } from 'react';

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
    // This would be replaced with actual Firebase authentication
    console.log('Signup with:', email, password);
    // Simulate successful signup
    const newUser = { email, uid: `user-${Date.now()}` };
    setCurrentUser(newUser);
    
    // Initialize user settings
    setUserSettings({
      [newUser.uid]: {
        integrations: {
          instantly: {
            apiKey: '',
            isConnected: false
          }
        }
      }
    });
    
    return newUser;
  };

  // Login function
  const login = async (email, password) => {
    // This would be replaced with actual Firebase authentication
    console.log('Login with:', email, password);
    // Simulate successful login
    const user = { email, uid: `user-${email.replace(/[^a-zA-Z0-9]/g, '')}` };
    setCurrentUser(user);
    
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
  };

  // Logout function
  const logout = async () => {
    // This would be replaced with actual Firebase authentication
    console.log('Logging out');
    setCurrentUser(null);
    setUserSettings({});
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
    // This would be replaced with actual Firebase auth state listener
    // For now, just simulate checking auth state
    const checkAuthState = () => {
      // Simulate no user being logged in initially
      setCurrentUser(null);
      setLoading(false);
    };

    checkAuthState();
  }, []);

  // Context value
  const value = {
    currentUser,
    signup,
    login,
    logout,
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
