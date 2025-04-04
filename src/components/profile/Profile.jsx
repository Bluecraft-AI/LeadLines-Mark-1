import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

const Profile = () => {
  const { currentUser, getUserSettings, updateUserSettings, updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Get user settings from context
  const userSettings = getUserSettings() || {
    integrations: {
      instantly: {
        apiKey: '',
        isConnected: false
      }
    }
  };
  
  // Local state for user data
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
    integrations: userSettings.integrations || {
      instantly: {
        apiKey: '',
        isConnected: false
      }
    }
  });

  // Fetch user profile from Supabase on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.uid)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (data) {
          setUserData(prevData => ({
            ...prevData,
            name: data.name || prevData.name,
            company: data.company || prevData.company,
            role: data.role || prevData.role,
            phone: data.phone || prevData.phone,
            notifications: data.notifications || prevData.notifications
          }));
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

  // Update local state when user settings change
  useEffect(() => {
    if (userSettings) {
      setUserData(prevData => ({
        ...prevData,
        integrations: userSettings.integrations || {
          instantly: {
            apiKey: '',
            isConnected: false
          }
        }
      }));
    }
  }, [userSettings]);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUser.uid,
          name: userData.name,
          company: userData.company,
          role: userData.role,
          phone: userData.phone,
          notifications: userData.notifications,
          updated_at: new Date()
        });
      
      if (error) {
        console.error('Error saving profile data:', error);
        return;
      }
      
      console.log('Profile data saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleSaveApiKey = async () => {
    // Save API key to user settings
    const updatedSettings = {
      ...userSettings,
      integrations: {
        ...userSettings.integrations,
        instantly: {
          apiKey: userData.integrations.instantly.apiKey,
          isConnected: true
        }
      }
    };
    
    updateUserSettings(updatedSettings);
    
    // Also save to Supabase
    try {
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: currentUser.uid,
          service: 'instantly',
          api_key: userData.integrations.instantly.apiKey,
          updated_at: new Date()
        });
      
      if (error) {
        console.error('Error saving API key:', error);
      }
    } catch (error) {
      console.error('Error in handleSaveApiKey:', error);
    }
    
    console.log('Saving Instantly API key for user:', currentUser?.email);
    setIsEditingApiKey(false);
  };

  const handleDisconnectInstantly = async () => {
    // Remove API key from user settings
    const updatedSettings = {
      ...userSettings,
      integrations: {
        ...userSettings.integrations,
        instantly: {
          apiKey: '',
          isConnected: false
        }
      }
    };
    
    updateUserSettings(updatedSettings);
    
    // Also remove from Supabase
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', currentUser.uid)
        .eq('service', 'instantly');
      
      if (error) {
        console.error('Error deleting API key:', error);
      }
    } catch (error) {
      console.error('Error in handleDisconnectInstantly:', error);
    }
    
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
    
    console.log('Disconnected Instantly integration for user:', currentUser?.email);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Profile</h2>
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

      {/* Integrations Section */}
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
            
            {isChangingPassword ? (
              <form onSubmit={handleUpdatePassword}>
                {passwordError && (
                  <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">
                    {passwordSuccess}
                  </div>
                )}
                <div className="mb-3">
                  <label className="block text-text-dark mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-text-dark mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-dark mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <button 
                className="btn-secondary"
                onClick={() => setIsChangingPassword(true)}
              >
                Update Password
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
