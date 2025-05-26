import React from 'react';
import ChatbotInterface from './ChatbotInterface';

/**
 * AgentPage component for the LeadLines AI Agent section
 * Simplified version that only includes the ChatbotInterface
 * Updated to work with the fixed header/footer design
 */
const AgentPage = () => {
  return (
    <div className="w-full h-full">
      <ChatbotInterface />
    </div>
  );
};

export default AgentPage;
