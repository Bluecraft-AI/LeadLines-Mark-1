import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { 
  saveOnboardingProgress, 
  loadOnboardingProgress, 
  clearOnboardingProgress 
} from '../../utils/localStorage';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import CompanyFundamentalsStep from './steps/CompanyFundamentalsStep';
import BusinessOverviewStep from './steps/BusinessOverviewStep';
import TargetMarketStep from './steps/TargetMarketStep';
import ClientIntelligenceStep from './steps/ClientIntelligenceStep';
import SocialProofStep from './steps/SocialProofStep';
import CompetitiveLandscapeStep from './steps/CompetitiveLandscapeStep';
import SalesMarketingStep from './steps/SalesMarketingStep';
import AssetsResourcesStep from './steps/AssetsResourcesStep';
import TechnicalSetupStep from './steps/TechnicalSetupStep';
import GoalsFinalStep from './steps/GoalsFinalStep';
import ProgressBar from './ProgressBar';

const OnboardingForm = () => {
  const { currentUser, completeOnboarding, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step configuration
  const steps = [
    { component: WelcomeStep, title: 'Welcome to LeadLines!' },
    { component: CompanyFundamentalsStep, title: 'Company Fundamentals' },
    { component: BusinessOverviewStep, title: 'Business Overview & Positioning' },
    { component: TargetMarketStep, title: 'Target Market Definition' },
    { component: ClientIntelligenceStep, title: 'Client Intelligence' },
    { component: SocialProofStep, title: 'Social Proof & Results' },
    { component: CompetitiveLandscapeStep, title: 'Competitive Landscape' },
    { component: SalesMarketingStep, title: 'Sales & Marketing Intelligence' },
    { component: AssetsResourcesStep, title: 'Assets & Resources' },
    { component: TechnicalSetupStep, title: 'Technical Setup & Operations' },
    { component: GoalsFinalStep, title: 'Goals and Final Information' }
  ];

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const completed = await checkOnboardingStatus(currentUser);
        if (completed) {
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }

      // Load saved progress
      const savedData = loadOnboardingProgress(currentUser.uid);
      if (savedData) {
        setFormData(savedData);
      }
    };

    checkOnboarding();
  }, [currentUser, navigate, checkOnboardingStatus]);

  // Save progress whenever formData changes
  useEffect(() => {
    if (currentUser && Object.keys(formData).length > 0) {
      saveOnboardingProgress(currentUser.uid, formData);
    }
  }, [formData, currentUser]);

  const handleNext = (stepData) => {
    const stepKey = `step_${currentStep}`;
    const updatedFormData = {
      ...formData,
      [stepKey]: stepData
    };
    
    setFormData(updatedFormData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit the form
      handleSubmit(updatedFormData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (finalFormData) => {
    setLoading(true);
    setError('');

    try {
      // Prepare data for webhook
      const webhookData = {
        user_id: currentUser.uid,
        email: currentUser.email,
        timestamp: new Date().toISOString(),
        onboarding_data: finalFormData
      };

      // Send to webhook (replace with your actual webhook URL)
      const webhookUrl = process.env.REACT_APP_ONBOARDING_WEBHOOK_URL || 'https://your-n8n-webhook-url.com/webhook/onboarding';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit onboarding data');
      }

      // Mark onboarding as completed
      const success = await completeOnboarding(currentUser);
      if (!success) {
        throw new Error('Failed to mark onboarding as completed');
      }

      // Clear saved progress
      clearOnboardingProgress(currentUser.uid);

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error submitting onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;
  const stepTitles = steps.map(step => step.title);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-secondary">LeadLines</div>
              <div className="text-gray-400">|</div>
              <div className="text-lg text-gray-600">Onboarding</div>
            </div>
            <div className="text-sm text-gray-500">
              Welcome, {currentUser.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ProgressBar 
          currentStep={currentStep}
          totalSteps={steps.length}
          stepTitles={stepTitles}
        />

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <CurrentStepComponent
            onNext={handleNext}
            onPrevious={handlePrevious}
            formData={formData[`step_${currentStep}`] || {}}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            loading={loading}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="text-center text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@leadlines.com" className="text-secondary hover:underline">
              support@leadlines.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm; 