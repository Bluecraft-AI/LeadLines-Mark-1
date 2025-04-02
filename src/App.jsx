import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import MainLayout from './components/common/MainLayout';

// Page Components
import Home from './components/common/Home';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import JobPostingForm from './components/forms/jobPosting/JobPostingForm';
import Profile from './components/profile/Profile';
import NotFound from './components/common/NotFound';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workflow/:id" 
        element={
          <ProtectedRoute>
            <MainLayout><JobPostingForm /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* 404 Route */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
