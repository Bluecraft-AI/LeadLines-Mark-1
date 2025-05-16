import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CalendarEmbed = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Define the Go High Level calendar embed URL
  const calendarUrl = 'https://form.bluecraft.ai/widget/booking/etmgsLRR2wxNiCSlJiI1';
  const calendarHeight = 700; // Define calendar height in one place for consistency
  
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
      {/* Header with no bottom margin */}
      <div className="flex justify-between items-center" style={{ marginBottom: '0' }}>
        <h2 className="text-2xl font-bold text-text-dark">Schedule a Call</h2>
      </div>

      {/* Loading spinner - shown only when iframe is loading */}
      {isLoading && (
        <div className="flex justify-center items-center h-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      )}
      
      {/* Calendar iframe - with specific styling to remove white space */}
      <div style={{ 
        lineHeight: 0, // Removes white space caused by line height
        fontSize: 0,   // Removes white space caused by font size
        marginTop: '-30px' // Slight negative margin to position calendar closer to text
      }}>
        <iframe 
          src={calendarUrl}
          style={{ 
            width: '100%', 
            border: 'none', 
            display: 'block', // Removes white space below iframe
            overflow: 'hidden', 
            height: `${calendarHeight}px`,
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0
          }}
          scrolling="no"
          frameBorder="0"
          id="etmgsLRR2wxNiCSlJiI1_1743733381977"
          onLoad={handleIframeLoad}
          title="Schedule a Call"
          allowTransparency="true"
        ></iframe>
      </div>
    </div>
  );
};

export default CalendarEmbed;
