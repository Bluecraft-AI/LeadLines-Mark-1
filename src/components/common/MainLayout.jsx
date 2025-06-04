import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  
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

  // Handle sidebar toggle
  const handleToggle = () => {
    if (isCollapsed) {
      // Expand
      setIsCollapsed(false);
      setIsExpanding(true);
      
      // Listen for width transition to complete
      const handleTransitionEnd = (e) => {
        if (e.propertyName === 'width') {
          setIsExpanding(false);
          sidebarRef.current?.removeEventListener('transitionend', handleTransitionEnd);
        }
      };
      sidebarRef.current?.addEventListener('transitionend', handleTransitionEnd);
      
    } else {
      // Collapse: Icons appear instantly for snappy feel!
      setIsCollapsed(true);
      // No more setIsCollapsing or delays - icons show immediately
    }
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

  // Navigation icons
  const DashboardIcon = ({ fill = "white" }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill}>
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  );

  const UploadIcon = ({ fill = "white" }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill}>
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      <path d="M12,11L8,15H10.5V18H13.5V15H16L12,11Z"/>
    </svg>
  );

  const SubmissionsIcon = ({ fill = "white" }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={fill}>
      <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M19,19H5V5H19V19Z"/>
      <path d="M7,7H17V9H7V7M7,11H17V13H7V11M7,15H14V17H7V15Z"/>
    </svg>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Panel with LeadLines button positioned to align with sidebar */}
      <header className="bg-secondary text-text-light p-4 pb-3 relative">
        <div className="container mx-auto flex justify-between items-center">
          {showNav && (
            <>
              {/* LeadLines button positioned to align with sidebar - FIXED WIDTH */}
              <div className="absolute left-0 top-0 w-44 h-full flex items-center bg-secondary">
                <Link 
                  to="/dashboard" 
                  className="text-2xl font-bold hover:text-accent transition-colors block px-4 py-2 text-center w-full"
                >
                  LeadLines
                </Link>
              </div>
              
              {/* Empty div to maintain layout balance - FIXED WIDTH */}
              <div className="w-44 invisible">
                {/* This space is intentionally left empty */}
              </div>
              
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
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - collapsible */}
        {showNav && (
          <aside 
            ref={sidebarRef}
            className={`bg-secondary text-text-light p-3 pt-2 flex flex-col relative transition-all duration-300 ease-out ${
              isCollapsed ? 'w-22' : 'w-44'
            }`}
            style={{
              zIndex: 40,
              overflow: 'visible'
            }}
          >
            {/* Toggle Button */}
            <button 
              onClick={handleToggle}
              className="absolute w-6 h-6 rounded-full bg-accent text-text-dark flex items-center justify-center hover:bg-accent-dark transition-colors"
              style={{
                right: '-12px', // Half of 24px button width
                bottom: '60px', // Parallel with profile button
                zIndex: 9999, // Ensure it's above all content
              }}
              aria-label="Toggle sidebar"
            >
              <span className="text-xs">
                {isCollapsed ? '▶' : '◀'}
              </span>
            </button>
            
            {/* Top Navigation Links */}
            <nav className="mb-auto">
              <ul className="space-y-3 mt-2">
                <li>
                  <Link 
                    to="/dashboard" 
                    className={`nav-link block rounded-md relative ${
                      location.pathname === '/dashboard' 
                        ? 'bg-accent text-text-dark' 
                        : 'bg-secondary text-text-light'
                    } ${
                      isCollapsed && !isExpanding 
                        ? 'w-10 h-10 mx-auto p-0 flex items-center justify-center' 
                        : 'py-2 px-4'
                    }`}
                    style={{
                      transition: isExpanding ? 'none' : 'all 0.1s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span className={`nav-text ${isCollapsed || isExpanding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ transition: isExpanding ? 'none' : 'opacity 0.15s ease-out' }}>
                      Dashboard
                    </span>
                    <div className={`nav-icon absolute inset-0 flex items-center justify-center ${isCollapsed && !isExpanding ? 'opacity-100' : 'opacity-0'}`} style={{ transition: isCollapsed && !isExpanding ? 'none' : 'none' }}>
                      <DashboardIcon fill={location.pathname === '/dashboard' ? '#17273f' : 'white'} />
                    </div>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/upload" 
                    className={`nav-link block rounded-md relative ${
                      location.pathname.startsWith('/upload') 
                        ? 'bg-accent text-text-dark' 
                        : 'bg-secondary text-text-light'
                    } ${
                      isCollapsed && !isExpanding 
                        ? 'w-10 h-10 mx-auto p-0 flex items-center justify-center' 
                        : 'py-2 px-4'
                    }`}
                    style={{
                      transition: isExpanding ? 'none' : 'all 0.1s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span className={`nav-text ${isCollapsed || isExpanding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ transition: isExpanding ? 'none' : 'opacity 0.15s ease-out' }}>
                      CSV Upload
                    </span>
                    <div className={`nav-icon absolute inset-0 flex items-center justify-center ${isCollapsed && !isExpanding ? 'opacity-100' : 'opacity-0'}`} style={{ transition: isCollapsed && !isExpanding ? 'none' : 'none' }}>
                      <UploadIcon fill={location.pathname.startsWith('/upload') ? '#17273f' : 'white'} />
                    </div>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/submissions" 
                    className={`nav-link block rounded-md relative ${
                      location.pathname === '/submissions' 
                        ? 'bg-accent text-text-dark' 
                        : 'bg-secondary text-text-light'
                    } ${
                      isCollapsed && !isExpanding 
                        ? 'w-10 h-10 mx-auto p-0 flex items-center justify-center' 
                        : 'py-2 px-4'
                    }`}
                    style={{
                      transition: isExpanding ? 'none' : 'all 0.1s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span className={`nav-text ${isCollapsed || isExpanding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ transition: isExpanding ? 'none' : 'opacity 0.15s ease-out' }}>
                      Submissions
                    </span>
                    <div className={`nav-icon absolute inset-0 flex items-center justify-center ${isCollapsed && !isExpanding ? 'opacity-100' : 'opacity-0'}`} style={{ transition: isCollapsed && !isExpanding ? 'none' : 'none' }}>
                      <SubmissionsIcon fill={location.pathname === '/submissions' ? '#17273f' : 'white'} />
                    </div>
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
                <div className="absolute bottom-full left-0 right-0 mb-2 mx-auto w-auto min-w-full bg-white rounded-md shadow-lg py-1 z-10">
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
        
        {/* Main Content - with strictly contained scrolling */}
        <main className="flex-1 overflow-hidden" style={{ zIndex: 1 }}>
          <div className="h-full overflow-y-auto p-4">
            <div className="container mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
