import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  // Check if we're on the home page or register page
  const isHomePage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';
  
  // Only show navigation links if user is logged in or not on home/register page
  const showNavLinks = currentUser || (!isHomePage && !isRegisterPage);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <header className="bg-secondary text-text-light p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LeadLines</h1>
          {showNavLinks && (
            <nav>
              <ul className="flex space-x-4">
                {currentUser ? (
                  <>
                    <li><Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link></li>
                    <li><Link to="/profile" className="hover:text-accent transition-colors">Profile</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
                  </>
                )}
              </ul>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-secondary text-text-light p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} LeadLines. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
