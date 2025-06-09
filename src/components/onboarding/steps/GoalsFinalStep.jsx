import React, { useState } from 'react';

const GoalsFinalStep = ({ onNext, onPrevious, formData, isFirstStep, isLastStep, allFormData }) => {
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

  // Define all required fields across ALL steps
  const getAllRequiredFields = () => {
    return {
      // Step 1: Company Fundamentals
      company_fundamentals: [
        'companyName', 'websiteUrl', 'businessAddress', 'industry',
        'contactName', 'contactTitle', 'contactPhone', 'contactEmail'
      ],
      // Step 2: Business Overview
      business_overview: [
        'businessDescription', 'coreProducts', 'salesCycleLength', 
        'initialEngagementLength', 'averageClientLifetime', 'renewalOpportunities',
        'problemsSolved', 'clientTransformationBefore', 'clientTransformationAfter', 
        'timelineToResults', 'primaryBenefit', 'elevatorPitch'
      ],
      // Step 3: Target Market
      target_market: [
        'idealClientDescription', 'idealClientUrls', 'targetJobTitles'
      ],
      // Step 4: Client Intelligence
      client_intelligence: [
        'painPoints', 'primaryGoals', 'triggers', 'competitorFrustrations', 'prospectQuestions', 'objections'
      ],
      // Step 5: Social Proof
      social_proof: [
        'caseStudies'
      ],
      // Step 6: Competitive Landscape
      competitive_landscape: [
        'competitors', 'uniqueDifferentiators'
      ],
      // Step 7: Sales & Marketing
      sales_marketing: [
        'guarantee', 'leadMagnets'
      ],
      // Step 8: Assets & Resources - no required fields
      assets_resources: [],
      // Step 9: Technical Setup
      technical_setup: [
        'emailSendingPlatform', 'emailHosting', 'leadDataSource', 'clayUsage', 'automationTools', 'helpNeeded'
      ],
      // Step 10: Goals & Final
      goals_final: [
        'primaryGoal', 'additionalInfo'
      ]
    };
  };

  const getFieldDisplayName = (fieldName) => {
    const displayNames = {
      // Company Fundamentals
      'companyName': 'Company Name',
      'websiteUrl': 'Website URL',
      'businessAddress': 'Primary Business Address',
      'industry': 'Industry/Vertical',
      'contactName': 'Primary Contact Name',
      'contactTitle': 'Primary Contact Title', 
      'contactPhone': 'Best Phone Number',
      'contactEmail': 'Best Email Address',
      
      // Business Overview
      'businessDescription': 'Business Description (2-3 sentences)',
      'coreProducts': 'Core Products/Services with Pricing',
      'salesCycleLength': 'Average Sales Cycle Length',
      'initialEngagementLength': 'Initial Engagement Length',
      'averageClientLifetime': 'Average Client Lifetime',
      'renewalOpportunities': 'Renewal/Upsell/Downsell Opportunities',
      'problemsSolved': 'Problems You Solve for Clients',
      'clientTransformationBefore': 'Client Transformation - Before State',
      'clientTransformationAfter': 'Client Transformation - After State',
      'timelineToResults': 'Timeline to Results',
      'primaryBenefit': 'Primary Benefit to Clients',
      'elevatorPitch': 'Elevator Pitch',
      
      // Target Market
      'idealClientDescription': 'Ideal Client Description',
      'idealClientUrls': 'URLs of 5+ Ideal Clients',
      'targetJobTitles': 'Target Job Titles',
      
      // Client Intelligence
      'painPoints': 'Top 3 Pain Points',
      'primaryGoals': 'Primary Goals/Desires',
      'triggers': 'Triggers to Seek Your Solution',
      'competitorFrustrations': 'Frustrations with Competitors',
      'prospectQuestions': 'Questions Prospects Would Respond To',
      'objections': 'Top 3 Objections and Responses',
      
      // Social Proof
      'caseStudies': 'Case Studies and Results',
      
      // Competitive Landscape
      'competitors': 'Top 3-5 Competitors',
      'uniqueDifferentiators': 'What Makes You Unique',
      
      // Sales & Marketing
      'guarantee': 'Guarantee or Risk Reversal',
      'leadMagnets': 'Lead Magnet Offers',
      
      // Technical Setup
      'emailSendingPlatform': 'Cold Email Sending Platform',
      'emailHosting': 'Email Hosting Provider',
      'leadDataSource': 'Lead Data Source',
      'clayUsage': 'Clay.com Usage',
      'automationTools': 'Marketing Automation Tools',
      'helpNeeded': 'Help Needed',
      
      // Goals & Final
      'primaryGoal': 'Primary Goal for Campaigns',
      'additionalInfo': 'Anything Else We Should Know'
    };

    return displayNames[fieldName] || fieldName;
  };

  const validateAllRequiredFields = () => {
    const allRequiredFields = getAllRequiredFields();
    const missingFields = [];
    
    // Combine current step data with all existing form data
    const completeFormData = {
      ...allFormData,
      goals_final: stepData
    };

    // Check each step's required fields
    Object.entries(allRequiredFields).forEach(([stepKey, fields]) => {
      const stepData = completeFormData[stepKey] || {};
      
      fields.forEach(fieldName => {
        if (fieldName === 'helpNeeded') {
          // Special handling for checkbox field - need at least one selected
          if (!stepData.helpNeeded || stepData.helpNeeded.trim() === '') {
            missingFields.push(`${getFieldDisplayName(fieldName)} (select at least one option)`);
          }
        } else {
          if (!stepData[fieldName]?.trim()) {
            missingFields.push(getFieldDisplayName(fieldName));
          }
        }
      });
    });

    return missingFields;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // First validate current step fields
    const currentStepRequiredFields = ['primaryGoal', 'additionalInfo'];
    const currentStepMissingFields = currentStepRequiredFields.filter(field => !stepData[field]?.trim());
    
    if (currentStepMissingFields.length > 0) {
      const fieldDisplayNames = {
        'primaryGoal': 'Primary Goal for Campaigns',
        'additionalInfo': 'Anything Else We Should Know'
      };
      
      const missingFieldNames = currentStepMissingFields.map(field => fieldDisplayNames[field]);
      alert(`Please fill in the following required fields on this step:\n\n• ${missingFieldNames.join('\n• ')}`);
      return;
    }
    
    // Then validate ALL required fields across the entire onboarding process
    const allMissingFields = validateAllRequiredFields();
    
    if (allMissingFields.length > 0) {
      alert(`Before completing your onboarding, please ensure all required fields are filled out.\n\nThe following required fields are missing:\n\n• ${allMissingFields.join('\n• ')}\n\nPlease go back to the previous steps and complete these fields before submitting.`);
      return;
    }
    
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
          <p>✅ We'll analyze your responses and create custom training docs</p>
          <p>✅ You'll receive a detailed review of your training docs to sign off on</p>
          <p>✅ Once approved, we'll create your personal workspace and AI Agent</p>
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
          Complete Onboarding
        </button>
      </div>
    </form>
  );
};

export default GoalsFinalStep; 