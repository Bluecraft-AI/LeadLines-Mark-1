import React, { useState, useEffect } from 'react';
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
import UploadPage from './components/upload/UploadPage';
import AgentPage from './components/agent/AgentPage';
import OnboardingForm from './components/onboarding/OnboardingForm';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, checkOnboardingStatus } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!currentUser) {
        setCheckingOnboarding(false);
        return;
      }
      
      try {
        const completed = await checkOnboardingStatus(currentUser);
        setOnboardingCompleted(completed);
        
        // If onboarding not completed and not already on onboarding page, redirect
        if (!completed && window.location.pathname !== '/onboarding') {
          window.location.href = '/onboarding';
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    
    checkOnboarding();
  }, [currentUser, checkOnboardingStatus]);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
      
      {/* Onboarding Route - Special handling, no MainLayout */}
      <Route path="/onboarding" element={<OnboardingForm />} />
      
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
            <MainLayout><UploadPage /></MainLayout>
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
