import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
  });

  // Initial form values
  const initialValues = {
    email: '',
    password: ''
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-text-dark mb-4">Welcome to LeadLines</h2>
      <p className="text-text-dark mb-8">Powerful Campaigns Made For You In Seconds.</p>
      
      <div className="max-w-md mx-auto mb-12">
        <div className="card">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Log In to Your Account</h3>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="text-left">
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
                    <a href="#" className="text-secondary hover:text-opacity-80">
                      Forgot password?
                    </a>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="mt-4 text-center">
            <p className="text-text-dark">
              Don't have an account?{' '}
              <Link to="/register" className="text-secondary hover:text-opacity-80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-accent p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-text-dark mb-3">Harness The Power</h3>
        <ul className="text-left text-text-dark space-y-2">
          <li>✓ Access proven sales workflows that generate leads and campaigns</li>
          <li>✓ Real-time cost estimation before launching campaigns</li>
          <li>✓ Target the perfect audience for your services</li>
          <li>✓ Save time with automated lead generation processes</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
