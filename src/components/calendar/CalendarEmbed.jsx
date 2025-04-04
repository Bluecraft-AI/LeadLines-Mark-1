import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CalendarEmbed = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Define the Go High Level calendar embed URL
  const calendarUrl = 'https://form.bluecraft.ai/widget/booking/etmgsLRR2wxNiCSlJiI1';
  const calendarHeight = 700; // Define calendar height in one place for consistency
  const bgColor = '#fbf9f9'; // Application background color
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  // Load the Go High Level script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://form.bluecraft.ai/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-text-dark">Schedule a Call</h2>
        <Link to="/dashboard" className="text-secondary hover:text-secondary-dark">
          Back to Dashboard
        </Link>
      </div>

      {/* Added negative margin to reduce space between heading and calendar */}
      <div className="relative mt-[-20px]" style={{ backgroundColor: 'transparent' }}>
        {/* Loading area with transparent background */}
        {isLoading && (
          <div 
            className="flex justify-center items-center absolute inset-0 z-10" 
            style={{ height: `${calendarHeight}px`, backgroundColor: 'transparent' }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        )}
        
        {/* Calendar container - with transparent background */}
        <div 
          className={`overflow-hidden ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ backgroundColor: 'transparent' }}
        >
          {/* Added a small top padding to create space for the header text */}
          <div style={{ paddingTop: '30px' }}>
            <iframe 
              src={calendarUrl}
              style={{ 
                width: '100%', 
                border: 'none', 
                overflow: 'hidden', 
                height: `${calendarHeight}px`,
                backgroundColor: 'transparent' // Ensure iframe background is transparent
              }}
              scrolling="no"
              id="etmgsLRR2wxNiCSlJiI1_1743733381977"
              onLoad={handleIframeLoad}
              title="Schedule a Call"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEmbed;
