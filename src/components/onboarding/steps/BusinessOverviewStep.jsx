import React, { useState } from 'react';

const BusinessOverviewStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStepData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          Client Engagement Timeline
        </h3>
        
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
              placeholder="e.g., 2 years, 5 years"
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
              placeholder="Describe opportunities"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="clientTransformationBefore" className="block text-sm font-medium text-gray-700 mb-2">
              Before state *
            </label>
            <textarea
              id="clientTransformationBefore"
              name="clientTransformationBefore"
              value={stepData.clientTransformationBefore}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="clientTransformationAfter" className="block text-sm font-medium text-gray-700 mb-2">
              After state *
            </label>
            <textarea
              id="clientTransformationAfter"
              name="clientTransformationAfter"
              value={stepData.clientTransformationAfter}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="timelineToResults" className="block text-sm font-medium text-gray-700 mb-2">
              Timeline to results *
            </label>
            <textarea
              id="timelineToResults"
              name="timelineToResults"
              value={stepData.timelineToResults}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
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
            rows={4}
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
            rows={5}
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