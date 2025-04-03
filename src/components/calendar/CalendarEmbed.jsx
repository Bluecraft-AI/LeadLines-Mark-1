import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CalendarEmbed = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

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
          {/* 
            CALENDAR EMBED INSTRUCTIONS:
            
            1. In your Go High-Level account, go to "Calendars" > "Calendar Settings"
            2. For your specific calendar, click the "three dots" icon and select "Share"
            3. In the pop-up modal, select the "Embed Code" tab and copy the iframe src URL
            4. Replace the placeholder URL below with your calendar embed URL
          */}
          <iframe 
            src="about:blank" 
            width="100%" 
            height="700" 
            frameBorder="0" 
            onLoad={handleIframeLoad}
            title="Schedule a Call"
            className="w-full"
          ></iframe>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Add Your Calendar</h3>
        <ol className="list-decimal pl-5 space-y-2 text-blue-800">
          <li>In your Go High-Level account, go to &quot;Calendars&quot; &gt; &quot;Calendar Settings&quot;</li>
          <li>For your specific calendar, click the &quot;three dots&quot; icon and select &quot;Share&quot;</li>
          <li>In the pop-up modal, select the &quot;Embed Code&quot; tab and copy the iframe src URL</li>
          <li>Open the file: <code className="bg-blue-100 px-2 py-1 rounded">/src/components/calendar/CalendarEmbed.jsx</code></li>
          <li>Replace the placeholder URL in the iframe src attribute with your calendar embed URL</li>
        </ol>
      </div>
    </div>
  );
};

export default CalendarEmbed; 