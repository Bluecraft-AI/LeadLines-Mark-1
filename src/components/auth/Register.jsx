import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, currentUser, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    const handleLoggedInUser = async () => {
      if (currentUser) {
        try {
          const onboardingCompleted = await checkOnboardingStatus(currentUser);
          if (onboardingCompleted) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          navigate('/dashboard'); // Fallback to dashboard if error
        }
      }
    };
    
    handleLoggedInUser();
  }, [currentUser, navigate, checkOnboardingStatus]);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  // Initial form values
  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      await signup(values.email, values.password);
      // Redirect to onboarding instead of dashboard for new users
      navigate('/onboarding');
    } catch (err) {
      setError('Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-text-dark mb-6 text-center">Create an Account</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="card">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-text-dark mb-1">Full Name</label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="John Doe"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-text-dark mb-1">Email</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="your@email.com"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-text-dark mb-1">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="••••••••"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-text-dark mb-1">Confirm Password</label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="••••••••"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-text-dark">
                  I agree to the <a href="#" className="text-secondary hover:text-opacity-80">Terms of Service</a> and <a href="#" className="text-secondary hover:text-opacity-80">Privacy Policy</a>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4 text-center">
          <p className="text-text-dark">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary hover:text-opacity-80">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
