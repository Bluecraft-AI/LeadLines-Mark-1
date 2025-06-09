import React, { useState, useEffect } from 'react';

const AssetsResourcesStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData }) => {
  const [stepData, setStepData] = useState(formData || {
    marketingAssets: '',
    campaignHistory: '',
    whatWorked: '',
    whatDidntWork: ''
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
    onNext(stepData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Existing Materials
        </h3>
        
        <div>
          <label htmlFor="marketingAssets" className="block text-sm font-medium text-gray-700 mb-2">
            List all current marketing/sales assets
          </label>
          <textarea
            id="marketingAssets"
            name="marketingAssets"
            value={stepData.marketingAssets}
            onChange={handleChange}
            rows={6}
            placeholder="Sales decks: [Links]&#10;Case study documents: [Links]&#10;Video content: [Links]&#10;Testimonial videos: [Links]&#10;Other: [Links]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Campaign History
        </h3>
        
        <div>
          <label htmlFor="campaignHistory" className="block text-sm font-medium text-gray-700 mb-2">
            Previous outbound campaign results
          </label>
          <textarea
            id="campaignHistory"
            name="campaignHistory"
            value={stepData.campaignHistory}
            onChange={handleChange}
            rows={6}
            placeholder="Cold calling: [Results/script if available]&#10;Cold email: [Results/copy if available]&#10;LinkedIn: [Results/templates if available]&#10;Other: [Results]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="whatWorked" className="block text-sm font-medium text-gray-700 mb-2">
            What has worked best historically?
          </label>
          <textarea
            id="whatWorked"
            name="whatWorked"
            value={stepData.whatWorked}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="whatDidntWork" className="block text-sm font-medium text-gray-700 mb-2">
            What has NOT worked?
          </label>
          <textarea
            id="whatDidntWork"
            name="whatDidntWork"
            value={stepData.whatDidntWork}
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

export default AssetsResourcesStep; 