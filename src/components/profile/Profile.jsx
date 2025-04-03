import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
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
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
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
