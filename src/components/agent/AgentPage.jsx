import React from 'react';
import ChatbotInterface from './ChatbotInterface';

/**
 * AgentPage component for the LeadLines AI Agent section
 * Simplified version that only includes the ChatbotInterface
 * Updated to ensure proper container sizing
 */
const AgentPage = () => {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <ChatbotInterface />
    </div>
  );
};

export default AgentPage;
