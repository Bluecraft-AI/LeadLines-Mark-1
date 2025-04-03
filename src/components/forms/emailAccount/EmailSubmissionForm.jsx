import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmailSubmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    domains: '',
    forwardingDomain: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateDomain = (domain) => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate domains
    if (!formData.domains.trim()) {
      newErrors.domains = 'Domains are required';
    } else {
      const domainList = formData.domains.split(',').map(d => d.trim());
      const invalidDomains = domainList.filter(d => !validateDomain(d));
      if (invalidDomains.length > 0) {
        newErrors.domains = `Invalid domain format: ${invalidDomains.join(', ')}`;
      }
    }
    
    // Validate forwarding domain
    if (!formData.forwardingDomain.trim()) {
      newErrors.forwardingDomain = 'Forwarding domain is required';
    } else if (!validateDomain(formData.forwardingDomain)) {
      newErrors.forwardingDomain = 'Invalid forwarding domain format';
    }
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // In a real implementation, this would send data to Airtable
        console.log('Submitting email account data:', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          domains: '',
          forwardingDomain: '',
          firstName: '',
          lastName: ''
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors({ submit: 'Failed to submit form. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Email Account Submission</h2>
        <Link to="/dashboard" className="text-secondary hover:text-secondary-dark">
          Back to Dashboard
        </Link>
      </div>

      <div className="card">
        {submitSuccess ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-text-dark mb-2">Submission Successful!</h3>
            <p className="text-gray-600 mb-4">Your email account details have been submitted successfully.</p>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Submit your email account details to set up your campaign delivery. All fields are required.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="domains" className="block text-text-dark mb-1 font-medium">
                  Input Your Domains
                </label>
                <input
                  type="text"
                  id="domains"
                  name="domains"
                  value={formData.domains}
                  onChange={handleChange}
                  placeholder="example.com, another-domain.com"
                  className={`w-full px-3 py-2 border ${errors.domains ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary`}
                />
                {errors.domains && (
                  <p className="mt-1 text-red-500 text-sm">{errors.domains}</p>
                )}
                <p className="mt-1 text-gray-500 text-sm">Enter comma-separated list of domains</p>
              </div>

              <div>
                <label htmlFor="forwardingDomain" className="block text-text-dark mb-1 font-medium">
                  Forwarding Domain
                </label>
                <input
                  type="text"
                  id="forwardingDomain"
                  name="forwardingDomain"
                  value={formData.forwardingDomain}
                  onChange={handleChange}
                  placeholder="forwarding-domain.com"
                  className={`w-full px-3 py-2 border ${errors.forwardingDomain ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary`}
                />
                {errors.forwardingDomain && (
                  <p className="mt-1 text-red-500 text-sm">{errors.forwardingDomain}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-text-dark mb-1 font-medium">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-red-500 text-sm">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-text-dark mb-1 font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-secondary`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-red-500 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errors.submit}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors mr-3"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Email Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailSubmissionForm; 