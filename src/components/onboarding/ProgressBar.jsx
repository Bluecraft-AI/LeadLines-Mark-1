import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, stepTitles }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      {/* Progress bar container */}
      <div className="relative mb-4">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Progress text */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="text-sm font-medium text-gray-900">
          {Math.round(progress)}% Complete
        </div>
      </div>
      
      {/* Current step title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {stepTitles[currentStep]}
        </h3>
      </div>
      
      {/* Step indicators (simplified for mobile) */}
      <div className="hidden md:flex justify-between mt-6">
        {stepTitles.map((title, index) => (
          <div 
            key={index}
            className="flex flex-col items-center flex-1"
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                index <= currentStep 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <div 
              className={`text-xs mt-2 text-center max-w-20 ${
                index === currentStep 
                  ? 'font-medium text-gray-900' 
                  : 'text-gray-500'
              }`}
            >
              {title.length > 20 ? `${title.substring(0, 17)}...` : title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar; 