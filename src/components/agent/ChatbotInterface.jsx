import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AssistantService from '../../services/AssistantService';

/**
 * ChatbotInterface component for the LeadLines AI Agent section
 * Integrates with n8n webhook and includes user's assistant_id
 */
const ChatbotInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Webhook URL for n8n
  const WEBHOOK_URL = "https://bluecraftleads.app.n8n.cloud/webhook/58a61a1c-ecab-43e9-ac4f-52664d6cfcb7/chat";

  // Generate a unique session ID for this conversation
  useEffect(() => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    console.log('Generated session ID:', newSessionId);
  }, []);

  // Fetch the user's assistant_id on component mount
  useEffect(() => {
    const fetchAssistantId = async () => {
      try {
        if (!currentUser) {
          setError('User not authenticated');
          return;
        }
        
        const assistant = await AssistantService.getUserAssistant();
        if (assistant && assistant.assistant_id) {
          setAssistantId(assistant.assistant_id);
          console.log('Fetched assistant ID:', assistant.assistant_id);
        } else {
          setError('No assistant found for user');
        }
      } catch (err) {
        console.error('Error fetching assistant ID:', err);
        setError('Failed to fetch assistant ID');
      }
    };
    
    fetchAssistantId();
  }, [currentUser]);

  // Add welcome message on component mount
  useEffect(() => {
    addMessage('assistant', 'Hello! I\'m your chat assistant. How can I help you today?');
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea based on content
  const autoResizeTextarea = (element) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 200) + 'px';
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add a message to the chat
  const addMessage = (sender, content, isTyping = false) => {
    const newMessage = {
      id: Date.now(),
      sender,
      content,
      isTyping,
      timestamp: new Date().toISOString()
    };
    
    // Use functional update to ensure we're working with the latest state
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage.id;
  };

  // Remove a message by ID
  const removeMessage = (messageId) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
  };

  // Show typing indicator
  const showTypingIndicator = () => {
    return addMessage('assistant', '', true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    autoResizeTextarea(e.target);
  };

  // Start a new conversation
  const startNewConversation = () => {
    // Generate new session ID
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    console.log('Started new conversation with session ID:', newSessionId);
    
    // Clear chat messages
    setMessages([]);
    
    // Add welcome message
    addMessage('assistant', 'Hello! I\'m your chat assistant. How can I help you today?');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const message = inputValue.trim();
    if (!message || isSubmitting) return;
    
    // Store the user message to add to chat
    const userMessage = message;
    
    // Clear input and reset height
    setInputValue('');
    const textarea = document.getElementById('chatInput');
    if (textarea) {
      textarea.style.height = 'auto';
    }
    
    // Add user message to chat - do this BEFORE showing typing indicator
    // to ensure it's not accidentally removed
    addMessage('user', userMessage);
    
    // Show typing indicator
    const typingIndicatorId = showTypingIndicator();
    setIsSubmitting(true);
    
    try {
      // Check if we have the assistant ID
      if (!assistantId) {
        throw new Error('Assistant ID not available');
      }
      
      // Prepare payload with assistant_id, conversationId, and message
      const payload = {
        assistant_id: assistantId,
        conversationId: sessionId,
        message: userMessage
      };
      
      console.log('Sending payload:', payload);
      
      // Send request to webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // Remove typing indicator
      removeMessage(typingIndicatorId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Extract the response message
      let botResponse = 'I received your message, but I\'m not sure how to respond.';
      
      if (typeof data === 'string') {
        botResponse = data;
      } else if (data && typeof data === 'object') {
        botResponse = data.output || 
                    data.response || 
                    data.message || 
                    data.text || 
                    data.reply || 
                    data.result || 
                    JSON.stringify(data);
      }
      
      // Add assistant response to chat
      addMessage('assistant', botResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      removeMessage(typingIndicatorId);
      
      // Show error message
      setError(error.message || 'Failed to send message');
      setTimeout(() => setError(''), 5000);
      
      // Add error message to chat
      addMessage('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle key press in textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-primary">
      <div className="flex justify-between items-center p-4 bg-secondary text-text-light">
        <div>
          <h1 className="text-xl font-semibold">AI Agent</h1>
        </div>
        <button 
          onClick={startNewConversation}
          className="bg-accent text-text-dark px-4 py-2 rounded-md hover:bg-opacity-90 transition-all"
        >
          New Conversation
        </button>
      </div>
      
      <div 
        ref={chatMessagesRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-secondary text-text-light flex items-center justify-center text-sm mr-2 flex-shrink-0">
                AI
              </div>
            )}
            
            <div 
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-secondary text-text-light rounded-br-sm' 
                  : 'bg-gray-100 text-text-dark rounded-bl-sm'
              }`}
            >
              {message.isTyping ? (
                <div className="flex space-x-1 items-center py-2 px-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
            
            {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-accent text-text-dark flex items-center justify-center text-sm ml-2 flex-shrink-0">
                U
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="bg-red-500 text-white p-3 text-center">
          {error}
        </div>
      )}
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            id="chatInput"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            rows="1"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSubmitting}
            className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-secondary text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotInterface; 