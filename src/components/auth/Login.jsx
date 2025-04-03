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
    <div>
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-text-dark mb-4">Welcome to LeadLines</h2>
        <p className="text-text-dark mb-8">Your platform for efficient job posting and candidate management.</p>
      </div>
      
      {/* Login Form and Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Login Form */}
        <div className="card">
          <h3 className="text-xl font-semibold text-text-dark mb-4 text-center">Log In to Your Account</h3>
          
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
                      Forgot your password?
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
        
        {/* Features Card */}
        <div className="card">
          <h3 className="text-xl font-semibold text-text-dark mb-3">Post Job Opportunities</h3>
          <p className="text-text-dark mb-4">Create detailed job postings that reach the right audience and attract qualified applicants.</p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-text-dark">Find Qualified Candidates</h4>
              <p className="text-sm text-text-dark">Use our advanced filtering system to discover the perfect candidates for your job openings.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-text-dark">Real-time Analytics</h4>
              <p className="text-sm text-text-dark">Track the performance of your job postings and optimize your recruitment strategy.</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/register" className="btn-secondary inline-block w-full text-center">Create Account</Link>
          </div>
        </div>
      </div>
      
      {/* Why Choose LeadLines Section */}
      <div className="mt-12 bg-accent p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-text-dark mb-3">Why Choose LeadLines?</h3>
        <ul className="text-left text-text-dark space-y-2">
          <li>✓ Streamlined candidate discovery process</li>
          <li>✓ Real-time cost estimation for job postings</li>
          <li>✓ Integration with leading job platforms</li>
          <li>✓ Advanced filtering and matching algorithms</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
