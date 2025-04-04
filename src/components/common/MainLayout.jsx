import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Check if we're on the home page or register page
  const isHomePage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';
  
  // Only show navigation links if user is logged in
  const showNavLinks = currentUser;

  // Get user's first initial for the profile circle
  const getUserInitial = () => {
    if (!currentUser) return 'U';
    
    // Try to get name from email first part
    const emailName = currentUser.email.split('@')[0];
    if (emailName) {
      return emailName[0].toUpperCase();
    }
    
    return 'U'; // Default if we can't get a proper initial
  };

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <header className="bg-secondary text-text-light p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LeadLines</h1>
          {showNavLinks && (
            <nav>
              <ul className="flex space-x-4 items-center">
                <li><Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link></li>
                <li><Link to="/submissions" className="hover:text-accent transition-colors">Submissions</Link></li>
                <li className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-8 h-8 rounded-full bg-accent text-text-dark flex items-center justify-center font-medium hover:bg-accent-dark transition-colors"
                    aria-label="Profile menu"
                  >
                    {getUserInitial()}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-text-dark hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-text-dark hover:bg-gray-100"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </li>
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
