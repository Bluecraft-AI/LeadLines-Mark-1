import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Profile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    role: '',
    email: ''
  });

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

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h5">Profile Settings</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
