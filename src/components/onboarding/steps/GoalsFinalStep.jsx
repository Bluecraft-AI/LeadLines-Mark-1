import React, { useState } from 'react';

const GoalsFinalStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep }) => {
  const [stepData, setStepData] = useState(formData || {
    primaryGoal: '',
    secondaryGoals: '',
    additionalInfo: '',
    questionsForTeam: ''
  });

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
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
        <h4 className="text-lg font-semibold text-green-900 mb-3">🎉 Almost Done!</h4>
        <p className="text-green-800">
          You're on the final step of your LeadLines onboarding. This information will help us 
          set clear expectations and ensure we deliver exactly what you need.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Business Objectives
        </h3>
        
        <div>
          <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700 mb-2">
            Primary goal for your campaigns *
          </label>
          <textarea
            id="primaryGoal"
            name="primaryGoal"
            value={stepData.primaryGoal}
            onChange={handleChange}
            rows={4}
            placeholder="e.g., Book 20 qualified demos per month, Generate 50 leads per week, Increase revenue by 30%"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="secondaryGoals" className="block text-sm font-medium text-gray-700 mb-2">
            Secondary goals
          </label>
          <textarea
            id="secondaryGoals"
            name="secondaryGoals"
            value={stepData.secondaryGoals}
            onChange={handleChange}
            rows={4}
            placeholder="Any additional objectives you'd like to achieve"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Final Information
        </h3>
        
        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
            Anything else we should know? *
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={stepData.additionalInfo}
            onChange={handleChange}
            rows={6}
            placeholder="Any special considerations, unique aspects of your business, specific challenges, or additional context that would help us create better campaigns for you"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        
        <div>
          <label htmlFor="questionsForTeam" className="block text-sm font-medium text-gray-700 mb-2">
            Questions for the LeadLines team?
          </label>
          <textarea
            id="questionsForTeam"
            name="questionsForTeam"
            value={stepData.questionsForTeam}
            onChange={handleChange}
            rows={4}
            placeholder="Any questions about our process, timeline, or how we can best support your goals"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">What Happens Next?</h4>
        <div className="text-blue-800 space-y-2">
          <p>✅ Your information will be processed by our LeadLines AI Agents</p>
          <p>✅ We'll analyze your responses and create a custom campaign strategy</p>
          <p>✅ You'll receive a detailed review of your campaign components</p>
          <p>✅ Once approved, we'll start crafting your personalized email sequences</p>
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
          className={`px-8 py-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all font-semibold text-lg ${isFirstStep ? 'ml-auto' : ''}`}
        >
          🚀 Complete Onboarding
        </button>
      </div>
    </form>
  );
};

export default GoalsFinalStep; 