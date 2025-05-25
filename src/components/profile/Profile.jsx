import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

const Profile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // First check if user exists
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', currentUser.uid)
          .single();

        if (userError) {
          // If user doesn't exist, create a new record
          if (userError.code === 'PGRST116') {
            try {
              const newUser = {
                firebase_uid: currentUser.uid,
                email: currentUser.email,
                full_name: 'New User',
                company: 'Your Company',
                role: 'Your Role'
              };
              
              const { error: insertError } = await supabase
                .from('users')
                .insert(newUser);
              
              if (insertError) throw insertError;
              
              // Also create user_settings record
              const { error: settingsError } = await supabase
                .from('user_settings')
                .insert({
                  firebase_uid: currentUser.uid,
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
              
              if (settingsError) throw settingsError;
              
              // Set form data with default values
              setFormData({
                fullName: 'New User',
                company: 'Your Company',
                role: 'Your Role',
                email: currentUser.email
              });
            } catch (err) {
              console.error('Error creating user record:', err);
              setError('Failed to create user profile. Please try again later.');
            }
          } else {
            console.error('Error fetching user data:', userError);
            setError('Failed to load profile data. Please try again later.');
          }
        } else {
          // User exists, set form data
          setFormData({
            fullName: userData.full_name || '',
            company: userData.company || '',
            role: userData.role || '',
            email: userData.email || currentUser.email
          });
        }
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update your profile');
      }

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          company: formData.company,
          role: formData.role,
          email: formData.email
        })
        .eq('firebase_uid', currentUser.uid);

      if (updateError) {
        // If update fails because record doesn't exist, create it
        if (updateError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              firebase_uid: currentUser.uid,
              email: formData.email,
              full_name: formData.fullName,
              company: formData.company,
              role: formData.role
            });
          
          if (insertError) throw insertError;
          
          // Also create user_settings if it doesn't exist
          const { error: settingsError } = await supabase
            .from('user_settings')
            .insert({
              firebase_uid: currentUser.uid,
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
          
          if (settingsError && !settingsError.message.includes('duplicate key')) {
            throw settingsError;
          }
        } else {
          throw updateError;
        }
      }

      setSuccess('Profile updated successfully!');
      console.log('Profile data saved successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5>Profile Settings</h5>
              </div>
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading profile data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5>Profile Settings</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-danger" role="alert">
                  {error || "Failed to load profile data. Please try again later."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Profile Settings</h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                  />
                  <small className="text-muted">
                    Email cannot be changed.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="company" className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-control"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
