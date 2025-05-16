import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import MainLayout from './components/common/MainLayout';

// Page Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import JobPostingForm from './components/forms/jobPosting/JobPostingForm';
import Profile from './components/profile/Profile';
import NotFound from './components/common/NotFound';
import EmailSubmissionForm from './components/forms/emailAccount/EmailSubmissionForm';
import CalendarEmbed from './components/calendar/CalendarEmbed';
import SubmissionsPage from './components/submissions/SubmissionsPage';
import AgentPage from './components/agent/AgentPage';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Login is now the main landing page */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
      
      {/* Protected Routes */}
      <Route 
        path="/submissions" 
        element={
          <ProtectedRoute>
            <MainLayout><SubmissionsPage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <MainLayout><JobPostingForm /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agent" 
        element={
          <ProtectedRoute>
            <MainLayout><AgentPage /></MainLayout>
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
      <Route 
        path="/email-submission" 
        element={
          <ProtectedRoute>
            <MainLayout><EmailSubmissionForm /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schedule-call" 
        element={
          <ProtectedRoute>
            <MainLayout><CalendarEmbed /></MainLayout>
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
