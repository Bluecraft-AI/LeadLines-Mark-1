import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../contexts/AuthContext';
import WorkflowService from '../../../services/WorkflowService';

const JobPostingCampaignForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Check if this is the Job Posting Campaign workflow (id=1)
  useEffect(() => {
    if (id !== '1') {
      // For now, only the Job Posting Campaign (id=1) is implemented
      navigate('/not-found');
    }
  }, [id, navigate]);

  // Validation schema
  const validationSchema = Yup.object({
    campaignName: Yup.string()
      .required('Campaign name is required')
      .min(3, 'Campaign name must be at least 3 characters'),
    targetIndustries: Yup.array()
      .min(1, 'Select at least one target industry'),
    jobTitles: Yup.string()
      .required('Job titles are required'),
    locations: Yup.array()
      .min(1, 'Select at least one location'),
    companySize: Yup.array()
      .min(1, 'Select at least one company size'),
    excludedCompanies: Yup.string(),
    additionalKeywords: Yup.string(),
    emailTemplate: Yup.string()
      .required('Email template is required')
      .min(50, 'Email template must be at least 50 characters')
  });

  // Initial form values
  const initialValues = {
    campaignName: '',
    targetIndustries: [],
    jobTitles: '',
    locations: [],
    companySize: [],
    excludedCompanies: '',
    additionalKeywords: '',
    emailTemplate: ''
  };

  // Calculate estimated cost based on form values
  const calculateEstimatedCost = (values) => {
    // Base calculation from job titles
    const baseEstimate = values.jobTitles.split(',').length * 15;
    
    // Apply modifiers based on other filters
    const locationModifier = values.locations.length > 0 ? 0.8 : 1;
    const industryModifier = values.targetIndustries.length > 0 ? 0.9 : 1;
    const keywordsModifier = values.additionalKeywords ? 0.7 : 1;
    const companySizeModifier = values.companySize.length > 0 ? 0.85 : 1;
    
    // Calculate estimated leads
    const estimatedLeads = baseEstimate * locationModifier * industryModifier * keywordsModifier * companySizeModifier;
    
    // Cost per lead (placeholder value)
    const costPerLead = 1.75;
    
    // Calculate total cost
    return (estimatedLeads * costPerLead).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // In a real implementation, this would send data to an API
      console.log('Submitting campaign:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Increment submission count for this workflow
      if (currentUser) {
        await WorkflowService.incrementSubmissionCount(currentUser.uid, parseInt(id));
        console.log('Incremented submission count for workflow:', id);
      }
      
      // Show success message
      setSubmitted(true);
      resetForm();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error('Error submitting campaign:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-text-dark mb-6">Job Posting Campaign</h2>
      <p className="text-gray-600 mb-6">
        This workflow finds companies with active job postings matching your criteria and generates leads for your outreach campaigns.
      </p>
      
      {submitted && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">Campaign submitted successfully!</span>
        </div>
      )}
      
      <div className="card">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, touched, errors }) => {
            // Update estimated cost whenever form values change
            React.useEffect(() => {
              setEstimatedCost(calculateEstimatedCost(values));
            }, [values]);
            
            return (
              <Form className="space-y-4">
                <div>
                  <label htmlFor="campaignName" className="block text-text-dark mb-1">Campaign Name</label>
                  <Field
                    type="text"
                    id="campaignName"
                    name="campaignName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="e.g., Tech Startups Outreach"
                  />
                  <ErrorMessage name="campaignName" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-text-dark mb-1">Target Industries</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="targetIndustries"
                        value="Technology"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Technology</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="targetIndustries"
                        value="Healthcare"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Healthcare</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="targetIndustries"
                        value="Finance"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Finance</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="targetIndustries"
                        value="Education"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Education</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="targetIndustries"
                        value="Retail"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Retail</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="targetIndustries"
                        value="Manufacturing"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Manufacturing</span>
                    </label>
                  </div>
                  <ErrorMessage name="targetIndustries" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label htmlFor="jobTitles" className="block text-text-dark mb-1">Job Titles</label>
                  <Field
                    as="textarea"
                    id="jobTitles"
                    name="jobTitles"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter job titles separated by commas (e.g., Software Engineer, Product Manager, UX Designer)"
                  />
                  <ErrorMessage name="jobTitles" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-text-dark mb-1">Locations</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="locations"
                        value="United States"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">United States</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="locations"
                        value="Remote"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Remote</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="locations"
                        value="Europe"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Europe</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="locations"
                        value="Asia"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">Asia</span>
                    </label>
                  </div>
                  <ErrorMessage name="locations" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label className="block text-text-dark mb-1">Company Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="companySize"
                        value="1-10"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">1-10 employees</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="companySize"
                        value="11-50"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">11-50 employees</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="companySize"
                        value="51-200"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">51-200 employees</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="companySize"
                        value="201-500"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">201-500 employees</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="companySize"
                        value="501-1000"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">501-1000 employees</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="companySize"
                        value="1001+"
                        className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="ml-2">1001+ employees</span>
                    </label>
                  </div>
                  <ErrorMessage name="companySize" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label htmlFor="excludedCompanies" className="block text-text-dark mb-1">Excluded Companies (Optional)</label>
                  <Field
                    as="textarea"
                    id="excludedCompanies"
                    name="excludedCompanies"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter companies to exclude, separated by commas"
                  />
                  <ErrorMessage name="excludedCompanies" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label htmlFor="additionalKeywords" className="block text-text-dark mb-1">Additional Keywords (Optional)</label>
                  <Field
                    type="text"
                    id="additionalKeywords"
                    name="additionalKeywords"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="e.g., React, JavaScript, Remote"
                  />
                  <ErrorMessage name="additionalKeywords" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                <div>
                  <label htmlFor="emailTemplate" className="block text-text-dark mb-1">Email Template</label>
                  <Field
                    as="textarea"
                    id="emailTemplate"
                    name="emailTemplate"
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Enter your email template. Use {{company}} and {{position}} as placeholders."
                  />
                  <ErrorMessage name="emailTemplate" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                
                {/* Cost Estimation Section */}
                <div className="bg-accent p-4 rounded-md">
                  <h3 className="text-lg font-semibold text-text-dark mb-2">Estimated Results and Costs</h3>
                  <p className="text-sm text-text-dark mb-3">Based on your filter criteria, here are the estimated results and costs. Adjust your filters to align with your budget.</p>
                  
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-text-dark">Estimated Companies:</span>
                    <span className="font-medium">{Math.round(estimatedCost / 1.75)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-text-dark">Estimated Decision Makers:</span>
                    <span className="font-medium">{Math.round(estimatedCost / 1.75 * 1.5)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-text-dark">Estimated Email Deliveries:</span>
                    <span className="font-medium">{Math.round(estimatedCost / 1.75 * 1.5 * 0.95)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 mt-1 font-bold">
                    <span className="text-text-dark">Total Estimated Cost:</span>
                    <span className="text-text-dark">${estimatedCost}</span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Launch Campaign'}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default JobPostingCampaignForm;
