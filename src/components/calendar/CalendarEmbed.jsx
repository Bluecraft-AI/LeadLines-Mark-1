import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CalendarEmbed = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Define the Go High Level calendar embed URL
  const calendarUrl = 'https://form.bluecraft.ai/widget/booking/etmgsLRR2wxNiCSlJiI1';
  
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Schedule a Call</h2>
        <Link to="/dashboard" className="text-secondary hover:text-secondary-dark">
          Back to Dashboard
        </Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        )}
        
        <div className={`calendar-container ${isLoading ? 'hidden' : 'block'}`}>
          <iframe 
            src={calendarUrl}
            style={{ width: '100%', border: 'none', overflow: 'hidden' }}
            scrolling="no"
            id="etmgsLRR2wxNiCSlJiI1_1743733381977"
            onLoad={handleIframeLoad}
            title="Schedule a Call"
            height="700"
          ></iframe>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Calendar Successfully Integrated</h3>
        <p className="text-blue-800">
          Your Go High Level calendar has been successfully integrated. Users can now schedule calls using this interface.
        </p>
        <p className="text-blue-800 mt-2">
          Calendar URL: <code className="bg-blue-100 px-2 py-1 rounded">{calendarUrl}</code>
        </p>
      </div>
    </div>
  );
};

export default CalendarEmbed; 