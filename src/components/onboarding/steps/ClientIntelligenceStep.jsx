import React, { useState, useEffect } from 'react';

const ClientIntelligenceStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  const [stepData, setStepData] = useState(formData || {
    painPoints: '',
    primaryGoals: '',
    triggers: '',
    competitorFrustrations: '',
    prospectQuestions: '',
    objections: '',
    frequentQuestions: ''
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
    const requiredFields = [
      'idealClientInterview1',
      'idealClientInterview2',
      'idealClientInterview3'
    ];
    
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      alert('Please provide at least 3 ideal client URLs for analysis.');
      return;
    }

    onNext(stepData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Pain Points & Motivations
        </h3>
        
        <div>
          <label htmlFor="painPoints" className="block text-sm font-medium text-gray-700 mb-2">
            Top 3 pain points your ideal clients face *
          </label>
          <textarea
            id="painPoints"
            name="painPoints"
            value={stepData.painPoints}
            onChange={handleChange}
            rows={6}
            placeholder="Pain point 1: [How you solve it]&#10;Pain point 2: [How you solve it]&#10;Pain point 3: [How you solve it]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="primaryGoals" className="block text-sm font-medium text-gray-700 mb-2">
            What are their primary goals/desires? *
          </label>
          <textarea
            id="primaryGoals"
            name="primaryGoals"
            value={stepData.primaryGoals}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="triggers" className="block text-sm font-medium text-gray-700 mb-2">
            What triggers them to seek your solution? *
          </label>
          <textarea
            id="triggers"
            name="triggers"
            value={stepData.triggers}
            onChange={handleChange}
            rows={4}
            placeholder="Specific events, seasons, business changes"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="competitorFrustrations" className="block text-sm font-medium text-gray-700 mb-2">
            Common frustrations with competitors/alternatives *
          </label>
          <textarea
            id="competitorFrustrations"
            name="competitorFrustrations"
            value={stepData.competitorFrustrations}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="prospectQuestions" className="block text-sm font-medium text-gray-700 mb-2">
            Questions your prospects would likely respond to? *
          </label>
          <textarea
            id="prospectQuestions"
            name="prospectQuestions"
            value={stepData.prospectQuestions}
            onChange={handleChange}
            rows={4}
            placeholder="Think of questions you would ask during cold calling"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Objections & Questions
        </h3>
        
        <div>
          <label htmlFor="objections" className="block text-sm font-medium text-gray-700 mb-2">
            Top 3 objections you hear and your responses *
          </label>
          <textarea
            id="objections"
            name="objections"
            value={stepData.objections}
            onChange={handleChange}
            rows={6}
            placeholder="[Objection 1]: [Your response]&#10;[Objection 2]: [Your response]&#10;[Objection 3]: [Your response]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="frequentQuestions" className="block text-sm font-medium text-gray-700 mb-2">
            Most frequent questions on sales calls and your responses
          </label>
          <textarea
            id="frequentQuestions"
            name="frequentQuestions"
            value={stepData.frequentQuestions}
            onChange={handleChange}
            rows={6}
            placeholder="[Question 1]: [Your answer]&#10;[Question 2]: [Your answer]&#10;[Question 3]: [Your answer]"
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

export default ClientIntelligenceStep; 