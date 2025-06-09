import React, { useState, useEffect } from 'react';

const CompetitiveLandscapeStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  const [stepData, setStepData] = useState(formData || {
    competitors: '',
    uniqueDifferentiators: '',
    pricingAdvantage: '',
    alternativeSpending: ''
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
    
    // Define required fields based on the questionnaire
    const requiredFields = [
      'competitors',
      'uniqueDifferentiators'
    ];
    
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      const fieldDisplayNames = {
        'competitors': 'Top 3-5 Competitors with Website Links',
        'uniqueDifferentiators': 'What Makes Your Company Unique'
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
        <div>
          <label htmlFor="competitors" className="block text-sm font-medium text-gray-700 mb-2">
            List your top 3-5 competitors with links to their website *
          </label>
          <textarea
            id="competitors"
            name="competitors"
            value={stepData.competitors}
            onChange={handleChange}
            rows={6}
            placeholder="[Competitor 1] - [Link]&#10;[Competitor 2] - [Link]&#10;[Competitor 3] - [Link]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="uniqueDifferentiators" className="block text-sm font-medium text-gray-700 mb-2">
            What makes your company unique and different from your competitors? *
          </label>
          <textarea
            id="uniqueDifferentiators"
            name="uniqueDifferentiators"
            value={stepData.uniqueDifferentiators}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="pricingAdvantage" className="block text-sm font-medium text-gray-700 mb-2">
            How is your pricing competitive or attractive compared to alternatives?
          </label>
          <textarea
            id="pricingAdvantage"
            name="pricingAdvantage"
            value={stepData.pricingAdvantage}
            onChange={handleChange}
            rows={4}
            placeholder="Is it better/faster/cheaper?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="alternativeSpending" className="block text-sm font-medium text-gray-700 mb-2">
            What do your clients usually spend their money on that would be better utilized via your product/service?
          </label>
          <textarea
            id="alternativeSpending"
            name="alternativeSpending"
            value={stepData.alternativeSpending}
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

export default CompetitiveLandscapeStep; 