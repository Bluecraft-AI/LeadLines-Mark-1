import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Check if we're on the home page, login page, or register page
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  
  // Only show navigation if user is logged in
  const showNav = currentUser;

  // Redirect logged-in users from login/register pages to dashboard
  useEffect(() => {
    if (currentUser && (isLoginPage || isRegisterPage)) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoginPage, isRegisterPage, navigate]);

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
    <div className="min-h-screen flex flex-col">
      {/* Top Panel */}
      <header className="bg-secondary text-text-light p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {showNav && (
            <>
              {/* LeadLines button on the left */}
              <Link 
                to="/dashboard" 
                className="text-2xl font-bold hover:text-accent transition-colors"
              >
                LeadLines
              </Link>
              
              {/* AI Agent button on the right */}
              <Link 
                to="/agent" 
                className="bg-accent text-text-dark px-4 py-2 rounded-md hover:bg-accent-dark transition-colors"
              >
                AI Agent
              </Link>
            </>
          )}
          
          {!showNav && (
            <>
              <h1 className="text-2xl font-bold">LeadLines</h1>
              <div></div> {/* Empty div for spacing when not logged in */}
            </>
          )}
        </div>
      </header>
      
      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar - moved from right to left and width reduced */}
        {showNav && (
          <aside className="w-32 bg-secondary text-text-light p-3 flex flex-col overflow-y-auto">
            {/* Top Navigation Links */}
            <nav className="mb-auto">
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/dashboard" 
                    className={`block py-2 px-3 rounded-md ${location.pathname === '/dashboard' ? 'bg-accent text-text-dark' : 'hover:bg-secondary-dark'} transition-colors text-center`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/upload" 
                    className={`block py-2 px-3 rounded-md ${location.pathname === '/upload' ? 'bg-accent text-text-dark' : 'hover:bg-secondary-dark'} transition-colors text-center`}
                  >
                    CSV Upload
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/submissions" 
                    className={`block py-2 px-3 rounded-md ${location.pathname === '/submissions' ? 'bg-accent text-text-dark' : 'hover:bg-secondary-dark'} transition-colors text-center`}
                  >
                    Submissions
                  </Link>
                </li>
              </ul>
            </nav>
            
            {/* Profile at the bottom */}
            <div className="mt-auto relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-center p-2 hover:bg-secondary-dark rounded-md transition-colors"
                aria-label="Profile menu"
              >
                <div className="w-10 h-10 rounded-full bg-accent text-text-dark flex items-center justify-center font-medium">
                  {getUserInitial()}
                </div>
              </button>
              
              {dropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-text-dark hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-text-dark hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
        
        {/* Main Content - with contained scrolling */}
        <main className="flex-grow overflow-y-auto p-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer removed as requested */}
    </div>
  );
};

export default MainLayout;
