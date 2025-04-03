import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  
  // Mock user data - in a real app, this would come from a database
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: currentUser?.email || 'john.doe@example.com',
    company: 'Acme Corporation',
    role: 'Hiring Manager',
    phone: '(555) 123-4567',
    notifications: {
      email: true,
      browser: false,
      mobile: true
    },
    integrations: {
      instantly: {
        apiKey: '',
        isConnected: false
      }
    }
  });

  // Load saved API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('instantly_api_key');
    if (savedApiKey) {
      setUserData(prevData => ({
        ...prevData,
        integrations: {
          ...prevData.integrations,
          instantly: {
            apiKey: savedApiKey,
            isConnected: true
          }
        }
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleApiKeyChange = (e) => {
    const { value } = e.target;
    setUserData({
      ...userData,
      integrations: {
        ...userData.integrations,
        instantly: {
          ...userData.integrations.instantly,
          apiKey: value
        }
      }
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setUserData({
      ...userData,
      notifications: {
        ...userData.notifications,
        [name]: checked
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to a database
    console.log('Saving profile data:', userData);
    setIsEditing(false);
  };

  const handleSaveApiKey = () => {
    // Save API key to localStorage
    localStorage.setItem('instantly_api_key', userData.integrations.instantly.apiKey);
    
    setUserData({
      ...userData,
      integrations: {
        ...userData.integrations,
        instantly: {
          ...userData.integrations.instantly,
          isConnected: true
        }
      }
    });
    
    console.log('Saving Instantly API key:', userData.integrations.instantly.apiKey);
    setIsEditingApiKey(false);
  };

  const handleDisconnectInstantly = () => {
    // Remove API key from localStorage
    localStorage.removeItem('instantly_api_key');
    
    setUserData({
      ...userData,
      integrations: {
        ...userData.integrations,
        instantly: {
          apiKey: '',
          isConnected: false
        }
      }
    });
    
    console.log('Disconnected Instantly integration');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Your Profile</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-secondary"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-text-dark mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              ) : (
                <p className="text-text-dark">{userData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-text-dark mb-1">Email</label>
              <p className="text-text-dark">{userData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-text-dark mb-1">Company</label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={userData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              ) : (
                <p className="text-text-dark">{userData.company}</p>
              )}
            </div>

            <div>
              <label className="block text-text-dark mb-1">Role</label>
              {isEditing ? (
                <input
                  type="text"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              ) : (
                <p className="text-text-dark">{userData.role}</p>
              )}
            </div>

            <div>
              <label className="block text-text-dark mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              ) : (
                <p className="text-text-dark">{userData.phone}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-dark mb-3">Notification Preferences</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="email"
                    checked={userData.notifications.email}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-text-dark">Email Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="browser"
                    checked={userData.notifications.browser}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-text-dark">Browser Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="mobile"
                    checked={userData.notifications.mobile}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-text-dark">Mobile Notifications</span>
                </label>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* New Integrations Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-text-dark mb-4">Integrations</h3>
        <div className="card">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-text-dark mb-2">Instantly.ai</h4>
                <p className="text-gray-600 mb-3">Connect your Instantly.ai account to enable campaign automation.</p>
              </div>
              <div className="flex items-center">
                {userData.integrations.instantly.isConnected && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs mr-3">
                    Connected
                  </span>
                )}
              </div>
            </div>
            
            {isEditingApiKey ? (
              <div className="mt-3">
                <label className="block text-text-dark mb-1">API Key</label>
                <div className="flex">
                  <input
                    type="password"
                    value={userData.integrations.instantly.apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="Enter your Instantly API key"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 bg-secondary text-white rounded-r-md hover:bg-secondary-dark transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can find your API key in your Instantly.ai account settings.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingApiKey(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                {userData.integrations.instantly.isConnected ? (
                  <>
                    <button
                      onClick={() => setIsEditingApiKey(true)}
                      className="btn-secondary"
                    >
                      Update API Key
                    </button>
                    <button
                      onClick={handleDisconnectInstantly}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingApiKey(true)}
                    className="btn-secondary"
                  >
                    Connect Instantly
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-text-dark mb-4">Account Security</h3>
        <div className="card">
          <div className="mb-4">
            <h4 className="text-lg font-medium text-text-dark mb-2">Change Password</h4>
            <p className="text-gray-600 mb-3">Ensure your account is using a strong password for security.</p>
            <button className="btn-secondary">Update Password</button>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium text-text-dark mb-2">Two-Factor Authentication</h4>
            <p className="text-gray-600 mb-3">Add additional security to your account by enabling two-factor authentication.</p>
            <button className="btn-secondary">Enable 2FA</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
