import React, { useState, useEffect } from 'react';

const SalesMarketingStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  const [stepData, setStepData] = useState(formData || {
    guarantee: '',
    leadMagnets: '',
    mustUseTerms: '',
    avoidTerms: '',
    coreMessages: ''
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
    
    // Validation
    const requiredFields = ['guarantee', 'leadMagnets'];
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      const fieldDisplayNames = {
        'guarantee': 'Guarantee or Risk Reversal',
        'leadMagnets': 'Lead Magnet Offers'
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
          Offers & Incentives
        </h3>
        
        <div>
          <label htmlFor="guarantee" className="block text-sm font-medium text-gray-700 mb-2">
            Do you offer a guarantee or risk reversal? *
          </label>
          <textarea
            id="guarantee"
            name="guarantee"
            value={stepData.guarantee}
            onChange={handleChange}
            rows={4}
            placeholder="e.g., 'XYZ result or you don't pay', money back guarantee, performance-based offer"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="leadMagnets" className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any lead magnet offers? *
          </label>
          <textarea
            id="leadMagnets"
            name="leadMagnets"
            value={stepData.leadMagnets}
            onChange={handleChange}
            rows={4}
            placeholder="trial/pilot offers, free service, free information (video/pdf/proven strategies), etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Messaging Preferences
        </h3>
        
        <div>
          <label htmlFor="mustUseTerms" className="block text-sm font-medium text-gray-700 mb-2">
            Must-use phrases or terminology
          </label>
          <textarea
            id="mustUseTerms"
            name="mustUseTerms"
            value={stepData.mustUseTerms}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="avoidTerms" className="block text-sm font-medium text-gray-700 mb-2">
            Words/phrases to AVOID
          </label>
          <textarea
            id="avoidTerms"
            name="avoidTerms"
            value={stepData.avoidTerms}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="coreMessages" className="block text-sm font-medium text-gray-700 mb-2">
            Core messages that resonate with your audience
          </label>
          <textarea
            id="coreMessages"
            name="coreMessages"
            value={stepData.coreMessages}
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

export default SalesMarketingStep; 