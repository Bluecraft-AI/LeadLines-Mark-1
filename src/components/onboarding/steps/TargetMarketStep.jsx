import React, { useState, useEffect } from 'react';

const TargetMarketStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  const [stepData, setStepData] = useState(formData || {
    idealClientDescription: '',
    industryVertical: '',
    annualRevenue: '',
    companySize: '',
    geographicLocation: '',
    technologiesUsed: '',
    budgetRange: '',
    idealClientUrls: '',
    targetJobTitles: '',
    secondaryInfluencers: ''
  });

  // Real-time save when stepData changes
  useEffect(() => {
    if (updateStepData) {
      updateStepData(stepData);
    }
  }, [stepData, updateStepData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any pending save operations before validation
    if (clearPendingSave) {
      clearPendingSave();
    }
    
    // Define required fields
    const requiredFields = [
      'idealClientDescription',
      'idealClientUrls', 
      'targetJobTitles'
    ];
    
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      const fieldDisplayNames = {
        'idealClientDescription': 'Ideal Client Description',
        'idealClientUrls': 'URLs of 5+ Ideal Clients',
        'targetJobTitles': 'Target Job Titles'
      };
      
      const missingFieldNames = missingFields.map(field => fieldDisplayNames[field]);
      alert(`Please fill in the following required fields:\n\n• ${missingFieldNames.join('\n• ')}`);
      return;
    }

    onNext(stepData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Ideal Client Profile
        </h3>
        
        <div>
          <label htmlFor="idealClientDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your absolute IDEAL client *
          </label>
          <textarea
            id="idealClientDescription"
            name="idealClientDescription"
            value={stepData.idealClientDescription}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="industryVertical" className="block text-sm font-medium text-gray-700 mb-2">
              Industry Vertical
            </label>
            <input
              type="text"
              id="industryVertical"
              name="industryVertical"
              value={stepData.industryVertical}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-700 mb-2">
              Annual Revenue
            </label>
            <input
              type="text"
              id="annualRevenue"
              name="annualRevenue"
              value={stepData.annualRevenue}
              onChange={handleChange}
              placeholder="e.g., $1M-$10M"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
              Company size (employees)
            </label>
            <input
              type="text"
              id="companySize"
              name="companySize"
              value={stepData.companySize}
              onChange={handleChange}
              placeholder="e.g., 50-200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="geographicLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Geographic location
            </label>
            <input
              type="text"
              id="geographicLocation"
              name="geographicLocation"
              value={stepData.geographicLocation}
              onChange={handleChange}
              placeholder="e.g., North America, Europe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="technologiesUsed" className="block text-sm font-medium text-gray-700 mb-2">
              Technologies they use
            </label>
            <input
              type="text"
              id="technologiesUsed"
              name="technologiesUsed"
              value={stepData.technologiesUsed}
              onChange={handleChange}
              placeholder="e.g., Salesforce, HubSpot"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-2">
              Budget range
            </label>
            <input
              type="text"
              id="budgetRange"
              name="budgetRange"
              value={stepData.budgetRange}
              onChange={handleChange}
              placeholder="e.g., $10K-$50K"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="idealClientUrls" className="block text-sm font-medium text-gray-700 mb-2">
            Provide URLs of 5+ ideal clients (current or dream) *
          </label>
          <textarea
            id="idealClientUrls"
            name="idealClientUrls"
            value={stepData.idealClientUrls}
            onChange={handleChange}
            rows={6}
            placeholder="[Company Name] - [URL] - [Why they're ideal]&#10;[Company Name] - [URL] - [Why they're ideal]&#10;..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Decision Makers
        </h3>
        
        <div>
          <label htmlFor="targetJobTitles" className="block text-sm font-medium text-gray-700 mb-2">
            Job titles you target (i.e. Owner, CEO, CFO, Head of Engineering, etc.) *
          </label>
          <textarea
            id="targetJobTitles"
            name="targetJobTitles"
            value={stepData.targetJobTitles}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="secondaryInfluencers" className="block text-sm font-medium text-gray-700 mb-2">
            What are some secondary influencers in the buying process?
          </label>
          <textarea
            id="secondaryInfluencers"
            name="secondaryInfluencers"
            value={stepData.secondaryInfluencers}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        {!isFirstStep && (
          <button 
            type="button" 
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-all font-medium"
          >
            Previous
          </button>
        )}
        
        <button 
          type="submit" 
          className={`px-6 py-3 bg-secondary text-white rounded-md hover:bg-opacity-90 transition-all font-medium ${isFirstStep ? 'ml-auto' : ''}`}
        >
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default TargetMarketStep; 