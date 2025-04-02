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

  // Sign up function
  const signup = async (email, password) => {
    // This would be replaced with actual Firebase authentication
    console.log('Signup with:', email, password);
    // Simulate successful signup
    setCurrentUser({ email });
    return { email };
  };

  // Login function
  const login = async (email, password) => {
    // This would be replaced with actual Firebase authentication
    console.log('Login with:', email, password);
    // Simulate successful login
    setCurrentUser({ email });
    return { email };
  };

  // Logout function
  const logout = async () => {
    // This would be replaced with actual Firebase authentication
    console.log('Logging out');
    setCurrentUser(null);
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
