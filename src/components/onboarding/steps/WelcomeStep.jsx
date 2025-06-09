import React from 'react';

const WelcomeStep = ({ onNext, isFirstStep, isLastStep }) => {
  const handleNext = () => {
    // Welcome step doesn't need to collect data, just proceed
    onNext({});
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to LeadLines!
        </h1>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          We're about to build high-converting cold email sequences tailored specifically to your business. 
          Whether you're looking to book demos, generate leads, drive software signups, or fill your sales 
          pipeline, the information you provide here will be the foundation of your success.
        </p>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            What makes LeadLines different:
          </h3>
          <p className="text-blue-800">
            We create a unique email for each lead, making this the most tailored cold email campaign 
            software available. Our AI analyzes every detail you share to craft personalized sequences 
            that speak directly to each prospect's specific situation and needs.
          </p>
        </div>
        
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3">
            This questionnaire is comprehensive, and for good reason.
          </h3>
          <p className="text-amber-800">
            Every question directly impacts your campaign performance. From crafting the perfect subject 
            line to tailoring your offer for each individual lead, we use this information to build 
            ready-to-send cold email sequences that actually convert.
          </p>
        </div>
        
        <p className="text-gray-700 mb-6">
          Once submitted, our LeadLines AI Agents will process your information and deliver your custom 
          campaign strategy. You'll review and approve each component before we start crafting tailored 
          cold email sequences.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <p className="text-gray-700 text-center">
            <strong>Questions?</strong> Reach out to{' '}
            <a href="mailto:success@leadlines.ai" className="text-secondary hover:text-opacity-80">
              success@leadlines.ai
            </a>{' '}
            anytime.
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-6">
            Let's build something extraordinary together.
          </p>
        </div>
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