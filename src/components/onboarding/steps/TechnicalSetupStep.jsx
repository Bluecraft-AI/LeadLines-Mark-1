import React, { useState, useEffect } from 'react';

const TechnicalSetupStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData }) => {
  const [stepData, setStepData] = useState(formData || {
    emailSendingPlatform: '',
    emailHosting: '',
    leadDataSource: '',
    clayUsage: '',
    automationTools: '',
    helpNeeded: '',
    compliance: ''
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
    
    // Define required fields based on the questionnaire
    const requiredFields = [
      'emailSendingPlatform',
      'emailHosting', 
      'leadDataSource',
      'clayUsage',
      'automationTools',
      'helpNeeded'
    ];
    
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (field === 'helpNeeded') {
        // For helpNeeded, we need at least one checkbox selected
        if (!stepData.helpNeeded || stepData.helpNeeded.trim() === '') {
          missingFields.push('Help Needed (select at least one option)');
        }
      } else {
        if (!stepData[field]?.trim()) {
          missingFields.push(getFieldDisplayName(field));
        }
      }
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`);
      return;
    }
    
    onNext(stepData);
  };

  const getFieldDisplayName = (fieldName) => {
    const displayNames = {
      'emailSendingPlatform': 'Cold Email Sending Platform',
      'emailHosting': 'Email Hosting Provider',
      'leadDataSource': 'Lead Data Source',
      'clayUsage': 'Clay.com Usage',
      'automationTools': 'Marketing Automation Tools'
    };
    return displayNames[fieldName] || fieldName;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Systems & Platforms
        </h3>
        
        <div>
          <label htmlFor="emailSendingPlatform" className="block text-sm font-medium text-gray-700 mb-2">
            What Cold Email Sending Platform are you using? *
          </label>
          <input
            type="text"
            id="emailSendingPlatform"
            name="emailSendingPlatform"
            value={stepData.emailSendingPlatform}
            onChange={handleChange}
            placeholder="i.e. Instantly, Smartlead, EmailBison, HubSpot, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="emailHosting" className="block text-sm font-medium text-gray-700 mb-2">
            What providers are you using for Email Hosting? *
          </label>
          <input
            type="text"
            id="emailHosting"
            name="emailHosting"
            value={stepData.emailHosting}
            onChange={handleChange}
            placeholder="i.e. Google, Microsoft, Instantly, Smartlead, ScaledMail, Mailreef, Hypertide, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="leadDataSource" className="block text-sm font-medium text-gray-700 mb-2">
            How are you sourcing your lead data? *
          </label>
          <input
            type="text"
            id="leadDataSource"
            name="leadDataSource"
            value={stepData.leadDataSource}
            onChange={handleChange}
            placeholder="i.e. Apollo.io, ZoomInfo, Ocean.io custom list provider, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="clayUsage" className="block text-sm font-medium text-gray-700 mb-2">
            Are you using Clay.com to enrich/personalize your lead data? *
          </label>
          <select
            id="clayUsage"
            name="clayUsage"
            value={stepData.clayUsage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          >
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="planning-to">Planning to start using it</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="automationTools" className="block text-sm font-medium text-gray-700 mb-2">
            What marketing automation tools are you using? *
          </label>
          <input
            type="text"
            id="automationTools"
            name="automationTools"
            value={stepData.automationTools}
            onChange={handleChange}
            placeholder="Zapier.com, Make.com, n8n workflows, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Help Needed
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Would you like help with any of the following? *
          </label>
          <div className="space-y-3">
            {[
              'Setting up your cold email sending platform',
              'Creating your diversified email account infrastructure',
              'Lead sourcing and list building',
              'Clay lead data enrichment/personalization for more targeted/relevant emails',
              'Creating custom marketing automations to speed up your operations'
            ].map((item, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  name="helpNeeded"
                  value={item}
                  checked={stepData.helpNeeded.includes(item)}
                  onChange={(e) => {
                    const { value, checked } = e.target;
                    if (checked) {
                      setStepData(prev => ({
                        ...prev,
                        helpNeeded: [...(prev.helpNeeded.split(', ').filter(Boolean)), value].join(', ')
                      }));
                    } else {
                      setStepData(prev => ({
                        ...prev,
                        helpNeeded: prev.helpNeeded.split(', ').filter(item => item !== value).join(', ')
                      }));
                    }
                  }}
                  className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Compliance
        </h3>
        
        <div>
          <label htmlFor="compliance" className="block text-sm font-medium text-gray-700 mb-2">
            Any industry compliance considerations or legal restrictions/disclaimers needed
          </label>
          <textarea
            id="compliance"
            name="compliance"
            value={stepData.compliance}
            onChange={handleChange}
            rows={4}
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

export default TechnicalSetupStep; 