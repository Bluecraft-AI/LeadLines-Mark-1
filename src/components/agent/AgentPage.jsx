import React from 'react';
import ChatbotInterface from './ChatbotInterface';

/**
 * AgentPage component for the LeadLines AI Agent section
 * Simplified version that only includes the ChatbotInterface
 * Updated to ensure proper container sizing and positioning
 */
const AgentPage = () => {
  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      height: "100%", 
      overflow: "hidden" 
    }}>
      <ChatbotInterface />
    </div>
  );
};

export default AgentPage;
