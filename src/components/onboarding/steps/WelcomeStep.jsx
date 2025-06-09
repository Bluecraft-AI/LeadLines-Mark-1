import React from 'react';

const WelcomeStep = ({ onNext, isFirstStep, isLastStep }) => {
  const handleNext = () => {
    // Welcome step doesn't need to collect data, just proceed
    onNext({});
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Welcome to LeadLines!
      </h3>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          We're about to build high-converting cold email sequences tailored specifically to your business. 
          Whether you're looking to book demos, generate leads, drive software signups, or fill your sales 
          pipeline, the information you provide here will be the foundation of your success.
        </p>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
        What makes LeadLines different:
      </h3>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          We create a unique email for each lead, making this the most tailored cold email campaign 
          software available. Our AI analyzes every detail you share to craft personalized sequences 
          that speak directly to each prospect's specific situation and needs.
        </p>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
        This questionnaire is comprehensive, and for good reason.
      </h3>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Every question directly impacts your campaign performance. From crafting the perfect subject 
          line to tailoring your offer for each individual lead, we use this information to build 
          ready-to-send cold email sequences that actually convert.
        </p>
        
        <p className="text-lg text-gray-700 mb-6">
          Once submitted, our LeadLines AI Agents will process your information and deliver your custom 
          campaign strategy. You'll review and approve each component before we start crafting tailored 
          cold email sequences.
        </p>
        
        <p className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Let's build something extraordinary together.
        </p>
        
        <p className="text-lg text-gray-700 mb-6">
          <strong>Questions?</strong> Reach out to{' '}
          <a href="mailto:success@leadlines.ai" className="text-secondary hover:text-opacity-80">
            success@leadlines.ai
          </a>
          {' '}anytime.
        </p>
      </div>
      
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button 
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-secondary text-white rounded-md hover:bg-opacity-90 transition-all font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep; 