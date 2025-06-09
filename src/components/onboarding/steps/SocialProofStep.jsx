import React, { useState, useEffect } from 'react';

const SocialProofStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, updateStepData, clearPendingSave }) => {
  const [stepData, setStepData] = useState(formData || {
    caseStudies: '',
    awards: '',
    mediaReferences: '',
    partnerships: '',
    clientFeedback: ''
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
    const requiredFields = ['caseStudies'];
    const missingFields = requiredFields.filter(field => !stepData[field]?.trim());
    
    if (missingFields.length > 0) {
      const fieldDisplayNames = {
        'caseStudies': 'Case Studies and Positive Results (2-3 examples)'
      };
      
      const missingFieldNames = missingFields.map(field => fieldDisplayNames[field]);
      alert(`Please fill in the following required fields:\n\n• ${missingFieldNames.join('\n• ')}`);
      return;
    }
    
    onNext(stepData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Case Study Framework</h4>
        <p className="text-blue-800 mb-3">
          <strong>General Formula:</strong> "We helped [Client/Industry] achieve [Specific Result] in [Timeframe] using [Your Unique Method]"
        </p>
        <p className="text-blue-800 text-sm">
          Include: (1) Client name/industry, (2) Quantifiable result, (3) Timeframe, (4) Unique mechanism
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Case Studies
        </h3>
        
        <div>
          <label htmlFor="caseStudies" className="block text-sm font-medium text-gray-700 mb-2">
            Your most recent CASE STUDIES and positive results (2-3 examples) *
          </label>
          <textarea
            id="caseStudies"
            name="caseStudies"
            value={stepData.caseStudies}
            onChange={handleChange}
            rows={8}
            placeholder="Example 1: Just recently helped [brand] increase their monthly revenue from 12k/month to 40k/month in just one month working with us.&#10;&#10;Example 2: I just helped Hanover, an online store similar to yours, increase their email revenue from 7,426 to 84,270 in just one month by making some small tweaks inside their email flows.&#10;&#10;Example 3: We just helped Mario Lanzarotti add 20k of new client revenue in just their first month working with us."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Credibility Markers
        </h3>
        
        <div>
          <label htmlFor="awards" className="block text-sm font-medium text-gray-700 mb-2">
            Awards, certifications, or recognition
          </label>
          <textarea
            id="awards"
            name="awards"
            value={stepData.awards}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="mediaReferences" className="block text-sm font-medium text-gray-700 mb-2">
            Media mentions, press coverage, or speaking engagements
          </label>
          <textarea
            id="mediaReferences"
            name="mediaReferences"
            value={stepData.mediaReferences}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        
        <div>
          <label htmlFor="partnerships" className="block text-sm font-medium text-gray-700 mb-2">
            Strategic partnerships or notable clients
          </label>
          <textarea
            id="partnerships"
            name="partnerships"
            value={stepData.partnerships}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Client Feedback
        </h3>
        
        <div>
          <label htmlFor="clientFeedback" className="block text-sm font-medium text-gray-700 mb-2">
            What do your best clients say about you? (Include 3-5 direct quotes)
          </label>
          <textarea
            id="clientFeedback"
            name="clientFeedback"
            value={stepData.clientFeedback}
            onChange={handleChange}
            rows={8}
            placeholder="Quote 1: &quot;[Direct client quote]&quot; - [Client Name/Company]&#10;&#10;Quote 2: &quot;[Direct client quote]&quot; - [Client Name/Company]&#10;&#10;Quote 3: &quot;[Direct client quote]&quot; - [Client Name/Company]"
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

export default SocialProofStep; 