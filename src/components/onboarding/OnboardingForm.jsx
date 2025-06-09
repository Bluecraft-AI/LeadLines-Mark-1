import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

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

const OnboardingForm = () => {
  const { currentUser, completeOnboarding, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [visitedSteps, setVisitedSteps] = useState(new Set([0]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sidebarRef = useRef(null);

  // Step configuration with shortened titles for sidebar
  const steps = [
    { component: WelcomeStep, title: 'Welcome', key: 'welcome' },
    { component: CompanyFundamentalsStep, title: 'Company Basics', key: 'company_fundamentals' },
    { component: BusinessOverviewStep, title: 'Business Overview', key: 'business_overview' },
    { component: TargetMarketStep, title: 'Target Market', key: 'target_market' },
    { component: ClientIntelligenceStep, title: 'Client Intelligence', key: 'client_intelligence' },
    { component: SocialProofStep, title: 'Social Proof', key: 'social_proof' },
    { component: CompetitiveLandscapeStep, title: 'Competition', key: 'competitive_landscape' },
    { component: SalesMarketingStep, title: 'Sales & Marketing', key: 'sales_marketing' },
    { component: AssetsResourcesStep, title: 'Assets & Resources', key: 'assets_resources' },
    { component: TechnicalSetupStep, title: 'Technical Setup', key: 'technical_setup' },
    { component: GoalsFinalStep, title: 'Goals & Final', key: 'goals_final' }
  ];

  // Load saved data from localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('leadlines_onboarding_data');
      const savedVisited = localStorage.getItem('leadlines_onboarding_visited');
      const savedStep = localStorage.getItem('leadlines_onboarding_current_step');
      
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
      if (savedVisited) {
        setVisitedSteps(new Set(JSON.parse(savedVisited)));
      }
      if (savedStep) {
        setCurrentStep(parseInt(savedStep));
      }
    } catch (error) {
      console.warn('Failed to load saved onboarding data:', error);
    }
  };

  // Save data to localStorage
  const saveData = () => {
    try {
      localStorage.setItem('leadlines_onboarding_data', JSON.stringify(formData));
      localStorage.setItem('leadlines_onboarding_visited', JSON.stringify([...visitedSteps]));
      localStorage.setItem('leadlines_onboarding_current_step', currentStep.toString());
    } catch (error) {
      console.warn('Failed to save onboarding data:', error);
    }
  };

  // Update visited steps
  const updateVisitedSteps = () => {
    setVisitedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(currentStep);
      return newSet;
    });
  };

  // Scroll to top of main content
  const scrollToTop = () => {
    const scrollableContainer = document.querySelector('main .h-full.overflow-y-auto');
    if (scrollableContainer) {
      scrollableContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (isCollapsed) {
      // Expanding
      setIsExpanding(true);
      setIsCollapsed(false);
      
      // Handle transition end
      const handleTransitionEnd = (e) => {
        if (e.target === sidebarRef.current && e.propertyName === 'width') {
          setIsExpanding(false);
          sidebarRef.current?.removeEventListener('transitionend', handleTransitionEnd);
        }
      };
      sidebarRef.current?.addEventListener('transitionend', handleTransitionEnd);
    } else {
      // Collapsing
      setIsCollapsed(true);
      setIsExpanding(false);
    }
  };

  // Go to specific step (only if visited)
  const goToStep = (stepIndex) => {
    if (visitedSteps.has(stepIndex) && stepIndex >= 0) {
      setCurrentStep(stepIndex);
      scrollToTop();
    }
  };

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
      loadSavedData();
    };

    checkOnboarding();
  }, [currentUser, navigate, checkOnboardingStatus]);

  // Save progress whenever formData or visitedSteps changes
  useEffect(() => {
    if (currentUser) {
      saveData();
    }
  }, [formData, visitedSteps, currentStep, currentUser]);

  const handleNext = (stepData) => {
    const stepKey = steps[currentStep].key;
    const updatedFormData = {
      ...formData,
      [stepKey]: stepData
    };
    
    setFormData(updatedFormData);
    updateVisitedSteps();

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setVisitedSteps(prev => {
        const newSet = new Set(prev);
        newSet.add(currentStep + 1);
        return newSet;
      });
      scrollToTop();
    } else {
      // Final step - submit the form
      handleSubmit(updatedFormData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleSubmit = async (finalFormData) => {
    setLoading(true);
    setIsSubmitting(true);
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
      const webhookUrl = process.env.REACT_APP_ONBOARDING_WEBHOOK_URL || 'https://bluecraftleads.app.n8n.cloud/webhook/e5e2d7f2-2569-4f26-bfaa-1bf8ca0d6f32';
      
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
      localStorage.removeItem('leadlines_onboarding_data');
      localStorage.removeItem('leadlines_onboarding_visited');
      localStorage.removeItem('leadlines_onboarding_current_step');

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error('Error submitting onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Render sidebar steps
  const renderSidebarSteps = () => {
    return steps.map((step, index) => {
      const isActive = visitedSteps.has(index);
      const isCurrent = index === currentStep;
      const isClickable = visitedSteps.has(index) && !isCurrent;
      
      const handleClick = () => {
        if (isClickable) {
          goToStep(index);
        }
      };

      if (isCollapsed && !isExpanding) {
        // Collapsed view - show only numbered circles
        return (
          <li 
            key={index}
            className={`flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
              isClickable ? 'cursor-pointer hover:bg-accent hover:bg-opacity-30' : ''
            } ${isCurrent ? 'bg-accent bg-opacity-20' : ''}`}
            onClick={handleClick}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
              isActive ? 'bg-accent text-text-dark' : 'bg-gray-600 text-gray-300'
            }`}>
              {index + 1}
            </div>
          </li>
        );
      } else if (isExpanding) {
        // During expansion - show only circles without text
        return (
          <li 
            key={index}
            className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
              isClickable ? 'cursor-pointer hover:bg-accent hover:bg-opacity-30' : ''
            } ${isCurrent ? 'bg-accent bg-opacity-20' : ''}`}
            onClick={handleClick}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
              isActive ? 'bg-accent text-text-dark' : 'bg-gray-600 text-gray-300'
            }`}>
              {index + 1}
            </div>
          </li>
        );
      } else {
        // Fully expanded view - show circles with text
        return (
          <li 
            key={index}
            className={`flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${
              isClickable ? 'cursor-pointer hover:bg-accent hover:bg-opacity-30' : ''
            } ${isCurrent ? 'bg-accent bg-opacity-20' : ''}`}
            onClick={handleClick}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
              isActive ? 'bg-accent text-text-dark' : 'bg-gray-600 text-gray-300'
            }`}>
              {index + 1}
            </div>
            <span className={`text-sm ${
              isCurrent ? 'font-medium text-white' : isClickable ? 'text-gray-200' : 'text-gray-300'
            }`} style={{ animation: 'fadeIn 0.2s ease-out' }}>
              {step.title}
            </span>
          </li>
        );
      }
    });
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
  const progress = isSubmitting ? 100 : (currentStep / steps.length) * 100; // Show 100% when submitting

  return (
    <div className="bg-gray-50 h-screen flex flex-col overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top Panel with LeadLines button positioned to align with sidebar */}
        <header className="bg-secondary text-text-light p-4 pb-3 relative min-h-16">
          <div className="container mx-auto flex justify-between items-center h-full">
            {/* LeadLines button positioned to align with sidebar - FIXED WIDTH */}
            <div className="absolute left-0 top-0 w-44 h-full flex items-center bg-secondary">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-2xl font-bold hover:text-accent transition-colors block px-4 py-2 text-center w-full"
              >
                LeadLines
              </button>
            </div>
            
            {/* Empty div to maintain layout balance - FIXED WIDTH */}
            <div className="w-44 invisible">
              {/* This space is intentionally left empty */}
            </div>
            
            <div></div> {/* Empty div for spacing */}
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - collapsible with step indicators */}
          <aside 
            ref={sidebarRef}
            className={`bg-secondary text-text-light p-3 pt-2 flex flex-col relative transition-all duration-300 ease-out ${
              isCollapsed ? 'w-22' : 'w-44'
            }`}
            style={{ zIndex: 40, overflow: 'visible' }}
          >
            {/* Toggle Button */}
            <button 
              onClick={handleSidebarToggle}
              className="absolute w-6 h-6 rounded-full bg-accent text-text-dark flex items-center justify-center hover:bg-accent-dark transition-colors"
              style={{
                right: '-12px',
                bottom: '60px',
                zIndex: 9999,
              }}
              aria-label="Toggle sidebar"
            >
              <span className="text-xs">
                {isCollapsed ? '▶' : '◀'}
              </span>
            </button>
            
            {/* Step Navigation */}
            <nav className="mb-auto">
              <ul className="space-y-2">
                {renderSidebarSteps()}
              </ul>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 overflow-hidden" style={{ zIndex: 1 }}>
            <div className="h-full overflow-y-auto p-4">
              <div className="container mx-auto">
                <div className="max-w-4xl mx-auto">
                  {/* Page Title */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-text-dark">Onboarding</h2>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="relative mb-4">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        Step {currentStep + 1} of {steps.length}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round(progress)}% Complete
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {steps[currentStep].title}
                      </h3>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {/* Step Container */}
                  <div className="bg-white rounded-lg shadow-sm border p-8">
                    <CurrentStepComponent
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      formData={formData[steps[currentStep].key] || {}}
                      isFirstStep={currentStep === 0}
                      isLastStep={currentStep === steps.length - 1}
                      loading={loading}
                      allFormData={currentStep === steps.length - 1 ? formData : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm; 