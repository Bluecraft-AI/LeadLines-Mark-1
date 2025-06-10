import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { login, resetPassword, currentUser, checkOnboardingStatus } = useAuth();
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

  // Login validation schema
  const loginValidationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
  });

  // Forgot password validation schema
  const forgotPasswordValidationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  // Initial form values for login
  const loginInitialValues = {
    email: '',
    password: ''
  };

  // Initial form values for forgot password
  const forgotPasswordInitialValues = {
    email: ''
  };

  // Handle login form submission
  const handleLoginSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      const user = await login(values.email, values.password);
      
      // Check onboarding status and redirect appropriately
      try {
        const onboardingCompleted = await checkOnboardingStatus(user);
        if (onboardingCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        navigate('/dashboard'); // Fallback to dashboard if error
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Handle forgot password form submission
  const handleForgotPasswordSubmit = async (values, { setSubmitting }) => {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      await resetPassword(values.email);
      setMessage('An email has been sent to you with instructions to reset your password. Please check your inbox and spam folder.');
    } catch (err) {
      console.error('Error sending password reset email:', err);
      
      // Provide specific error messages
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email address');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many password reset requests. Please try again later');
      } else {
        setError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Toggle between login and forgot password modes
  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError('');
    setMessage('');
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-text-dark mb-4">Welcome to LeadLines</h2>
      <p className="text-text-dark mb-8">
        {isForgotPassword 
          ? "Enter your email address and we'll send you a link to reset your password."
          : "Powerful Campaigns Made For You In Seconds."
        }
      </p>
      
      <div className="max-w-md mx-auto mb-12">
        <div className="card">
          <h3 className="text-xl font-semibold text-text-dark mb-4">
            {isForgotPassword ? 'Reset Your Password' : 'Log In to Your Account'}
          </h3>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          
          <Formik
            initialValues={isForgotPassword ? forgotPasswordInitialValues : loginInitialValues}
            validationSchema={isForgotPassword ? forgotPasswordValidationSchema : loginValidationSchema}
            onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleLoginSubmit}
            enableReinitialize={true}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="text-left">
                  <label htmlFor="email" className="block text-text-dark mb-1">
                    {isForgotPassword ? 'Email Address' : 'Email'}
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="your@email.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                {!isForgotPassword && (
                  <div className="text-left">
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
                )}
                
                {!isForgotPassword && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-text-dark">
                        Remember me
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="text-secondary hover:text-opacity-80"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading 
                    ? (isForgotPassword ? 'Sending...' : 'Logging in...') 
                    : (isForgotPassword ? 'Send Reset Email' : 'Log In')
                  }
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="mt-4 text-center">
            {isForgotPassword ? (
              <p className="text-text-dark">
                Remember your password?{' '}
                <button
                  onClick={toggleForgotPassword}
                  className="text-secondary hover:text-opacity-80"
                >
                  Back to Login
                </button>
              </p>
            ) : (
              <p className="text-text-dark">
                Don't have an account?{' '}
                <Link to="/register" className="text-secondary hover:text-opacity-80">
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-accent p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-text-dark mb-3">
          {isForgotPassword ? 'Password Reset Help' : 'Harness The Power'}
        </h3>
        {isForgotPassword ? (
          <div className="text-left text-text-dark space-y-2">
            <p>• Check your email inbox and spam folder for the reset link</p>
            <p>• The reset link will expire in 1 hour for security</p>
            <p>• If you don't receive an email, try again or contact support</p>
            <p>• Make sure to use a strong password when resetting</p>
          </div>
        ) : (
          <ul className="text-left text-text-dark space-y-2">
            <li>✓ Access proven sales workflows that generate leads and campaigns</li>
            <li>✓ Real-time cost estimation before launching campaigns</li>
            <li>✓ Target the perfect audience for your services</li>
            <li>✓ Save time with automated lead generation processes</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Login;
