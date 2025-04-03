import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InstantlyService from '../../services/InstantlyService';
import { useAuth } from '../../contexts/AuthContext';

const MappingModal = ({ isOpen, onClose, airtableData, onSubmit }) => {
  const { currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Campaign, 2: Map Fields, 3: Confirm
  const [fieldMapping, setFieldMapping] = useState({
    email: 'email',
    firstName: 'first_name',
    lastName: 'last_name',
    companyName: 'company_name'
  });
  
  // Load campaigns on modal open
  React.useEffect(() => {
    if (isOpen && step === 1) {
      loadCampaigns();
    }
  }, [isOpen, step]);
  
  // Load campaigns from Instantly
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignsData = await InstantlyService.getCampaigns(currentUser.uid);
      setCampaigns(campaignsData.data || []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns from Instantly');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle campaign selection
  const handleCampaignChange = (e) => {
    setSelectedCampaign(e.target.value);
  };
  
  // Handle field mapping change
  const handleFieldMappingChange = (field, value) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Move to next step
  const nextStep = () => {
    if (step === 1 && !selectedCampaign) {
      setError('Please select a campaign');
      return;
    }
    
    if (step === 2 && !fieldMapping.email) {
      setError('Email field mapping is required');
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };
  
  // Move to previous step
  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };
  
  // Handle final submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await onSubmit(selectedCampaign, fieldMapping);
      onClose();
    } catch (err) {
      console.error('Error submitting mapping:', err);
      setError(err.message || 'Failed to upload data to Instantly');
    } finally {
      setLoading(false);
    }
  };
  
  // Get available fields from Airtable data
  const getAvailableFields = () => {
    if (!airtableData || airtableData.length === 0) return [];
    return Object.keys(airtableData[0]);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-dark">Upload to Instantly</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : (
            <>
              {/* Step indicators */}
              <div className="flex mb-8">
                <div className={`flex-1 text-center pb-2 ${step === 1 ? 'border-b-2 border-secondary font-semibold' : 'border-b border-gray-300'}`}>
                  1. Select Campaign
                </div>
                <div className={`flex-1 text-center pb-2 ${step === 2 ? 'border-b-2 border-secondary font-semibold' : 'border-b border-gray-300'}`}>
                  2. Map Fields
                </div>
                <div className={`flex-1 text-center pb-2 ${step === 3 ? 'border-b-2 border-secondary font-semibold' : 'border-b border-gray-300'}`}>
                  3. Confirm
                </div>
              </div>
              
              {/* Step 1: Select Campaign */}
              {step === 1 && (
                <div>
                  <p className="mb-4 text-gray-600">
                    Select the Instantly campaign where you want to upload your leads.
                  </p>
                  
                  <div className="mb-6">
                    <label htmlFor="campaign" className="block text-text-dark mb-2 font-medium">
                      Campaign
                    </label>
                    <select
                      id="campaign"
                      value={selectedCampaign}
                      onChange={handleCampaignChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map(campaign => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> You need to have at least one campaign created in your Instantly account.
                      If you don&apos;t see any campaigns, please create one in your Instantly dashboard first.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 2: Map Fields */}
              {step === 2 && (
                <div>
                  <p className="mb-4 text-gray-600">
                    Map your Airtable fields to Instantly fields. Email is required.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-text-dark mb-2 font-medium">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={fieldMapping.email}
                        onChange={(e) => handleFieldMappingChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Select field</option>
                        {getAvailableFields().map(field => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-text-dark mb-2 font-medium">
                        First Name
                      </label>
                      <select
                        value={fieldMapping.firstName}
                        onChange={(e) => handleFieldMappingChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Select field</option>
                        {getAvailableFields().map(field => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-text-dark mb-2 font-medium">
                        Last Name
                      </label>
                      <select
                        value={fieldMapping.lastName}
                        onChange={(e) => handleFieldMappingChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Select field</option>
                        {getAvailableFields().map(field => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-text-dark mb-2 font-medium">
                        Company Name
                      </label>
                      <select
                        value={fieldMapping.companyName}
                        onChange={(e) => handleFieldMappingChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Select field</option>
                        {getAvailableFields().map(field => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Confirm */}
              {step === 3 && (
                <div>
                  <p className="mb-4 text-gray-600">
                    Please review your mapping settings before uploading to Instantly.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                    <h3 className="font-semibold mb-2">Selected Campaign</h3>
                    <p className="mb-4">{campaigns.find(c => c.id === selectedCampaign)?.name || 'Unknown'}</p>
                    
                    <h3 className="font-semibold mb-2">Field Mapping</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-gray-600">Email:</div>
                      <div>{fieldMapping.email || 'Not mapped'}</div>
                      
                      <div className="text-gray-600">First Name:</div>
                      <div>{fieldMapping.firstName || 'Not mapped'}</div>
                      
                      <div className="text-gray-600">Last Name:</div>
                      <div>{fieldMapping.lastName || 'Not mapped'}</div>
                      
                      <div className="text-gray-600">Company Name:</div>
                      <div>{fieldMapping.companyName || 'Not mapped'}</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> This will upload {airtableData?.length || 0} leads to your Instantly campaign.
                      The process may take a moment to complete.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Modal footer */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="btn-primary"
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={loading}
              >
                Upload to Instantly
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingModal; 