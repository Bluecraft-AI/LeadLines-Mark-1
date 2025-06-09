import React, { useState, useEffect } from 'react';

const BusinessOverviewStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  const [stepData, setStepData] = useState(formData || {
    businessMission: '',
    businessDescription: '',
    coreProducts: '',
    clientEngagementTimeline: '',
    salesCycleLength: '',
    initialEngagementLength: '',
    averageClientLifetime: '',
    renewalOpportunities: '',
    problemsSolved: '',
    clientTransformationBefore: '',
    clientTransformationAfter: '',
    timelineToResults: '',
    primaryBenefit: '',
    elevatorPitch: ''
  });

  // Real-time save when stepData changes
  useEffect(() => {
    if (updateStepData) {
      updateStepData(stepData);
    }
  }, [stepData, updateStepData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any pending save operations before validation
    if (clearPendingSave) {
      clearPendingSave();
    }
    
    // Validation
    const requiredFields = ['businessDescription', 'primaryRevenue', 'businessModel'];
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      const fieldDisplayNames = {
        'businessDescription': 'Business Description',
        'primaryRevenue': 'Primary Revenue Source',
        'businessModel': 'Business Model'
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
          Core Business
        </h3>
        
        <div>
          <label htmlFor="businessMission" className="block text-sm font-medium text-gray-700 mb-2">
            Business Mission/Vision Statement
          </label>
          <textarea
            id="businessMission"
            name="businessMission"
            value={stepData.businessMission}
            onChange={handleChange}
            rows={3}
            placeholder="What is your company's mission and vision?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your business in 2-3 sentences *
          </label>
          <textarea
            id="businessDescription"
            name="businessDescription"
            value={stepData.businessDescription}
            onChange={handleChange}
            rows={4}
            placeholder="What does your company do? Who do you serve? What makes you unique?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="coreProducts" className="block text-sm font-medium text-gray-700 mb-2">
            List your core products/services with pricing *
          </label>
          <textarea
            id="coreProducts"
            name="coreProducts"
            value={stepData.coreProducts}
            onChange={handleChange}
            rows={6}
            placeholder="Product/Service 1: [Description] - [Price]&#10;Product/Service 2: [Description] - [Price]&#10;Product/Service 3: [Description] - [Price]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Client Engagement Timeline *
        </h3>
        <p className="text-sm text-gray-600 mb-4">All fields in this section are required</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="salesCycleLength" className="block text-sm font-medium text-gray-700 mb-2">
              Average sales cycle length *
            </label>
            <input
              type="text"
              id="salesCycleLength"
              name="salesCycleLength"
              value={stepData.salesCycleLength}
              onChange={handleChange}
              placeholder="e.g., 30 days, 3 months"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="initialEngagementLength" className="block text-sm font-medium text-gray-700 mb-2">
              Initial engagement length *
            </label>
            <input
              type="text"
              id="initialEngagementLength"
              name="initialEngagementLength"
              value={stepData.initialEngagementLength}
              onChange={handleChange}
              placeholder="e.g., 6 months, 1 year"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="averageClientLifetime" className="block text-sm font-medium text-gray-700 mb-2">
              Average client lifetime *
            </label>
            <input
              type="text"
              id="averageClientLifetime"
              name="averageClientLifetime"
              value={stepData.averageClientLifetime}
              onChange={handleChange}
              placeholder="e.g., 2 years, 18 months"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="renewalOpportunities" className="block text-sm font-medium text-gray-700 mb-2">
              Renewal/upsell/downsell opportunities *
            </label>
            <input
              type="text"
              id="renewalOpportunities"
              name="renewalOpportunities"
              value={stepData.renewalOpportunities}
              onChange={handleChange}
              placeholder="e.g., Annual renewals, quarterly upsells"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Value Proposition
        </h3>
        
        <div>
          <label htmlFor="problemsSolved" className="block text-sm font-medium text-gray-700 mb-2">
            What specific problem(s) do you solve for clients? *
          </label>
          <textarea
            id="problemsSolved"
            name="problemsSolved"
            value={stepData.problemsSolved}
            onChange={handleChange}
            rows={4}
            placeholder="What specific challenges or pain points do you address?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What transformation do clients experience? *
          </label>
          <p className="text-sm text-gray-600 mb-4">All fields in this section are required</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="clientTransformationBefore" className="block text-sm font-medium text-gray-600 mb-1">
                Before state: *
              </label>
              <textarea
                id="clientTransformationBefore"
                name="clientTransformationBefore"
                value={stepData.clientTransformationBefore}
                onChange={handleChange}
                rows={2}
                placeholder="What situation are clients in before working with you?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="clientTransformationAfter" className="block text-sm font-medium text-gray-600 mb-1">
                After state: *
              </label>
              <textarea
                id="clientTransformationAfter"
                name="clientTransformationAfter"
                value={stepData.clientTransformationAfter}
                onChange={handleChange}
                rows={2}
                placeholder="What improved situation do they achieve?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="timelineToResults" className="block text-sm font-medium text-gray-600 mb-1">
                Timeline to results: *
              </label>
              <input
                type="text"
                id="timelineToResults"
                name="timelineToResults"
                value={stepData.timelineToResults}
                onChange={handleChange}
                placeholder="e.g., 30 days, 3 months, 6 months"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="primaryBenefit" className="block text-sm font-medium text-gray-700 mb-2">
            What is the primary BENEFIT that your product/service brings to your clients? *
          </label>
          <textarea
            id="primaryBenefit"
            name="primaryBenefit"
            value={stepData.primaryBenefit}
            onChange={handleChange}
            rows={3}
            placeholder="What is the main value or benefit clients receive?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="elevatorPitch" className="block text-sm font-medium text-gray-700 mb-2">
            Elevator Pitch (60 seconds at a networking event) *
          </label>
          <textarea
            id="elevatorPitch"
            name="elevatorPitch"
            value={stepData.elevatorPitch}
            onChange={handleChange}
            rows={4}
            placeholder="How would you quickly describe your business and value proposition in 60 seconds?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
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

export default BusinessOverviewStep; 