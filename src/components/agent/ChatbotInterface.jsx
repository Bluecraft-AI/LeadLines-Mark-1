import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AssistantService from '../../services/AssistantService';

/**
 * ChatbotInterface component for the LeadLines AI Agent section
 * Direct adaptation of the working HTML version to React
 * With updated UI to match LeadLines application style
 */
const ChatbotInterface = () => {
  // DOM References
  const chatMessagesRef = useRef(null);
  const chatInputRef = useRef(null);
  const sendButtonRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Internal state references (not React state)
  const sessionIdRef = useRef('');
  const assistantIdRef = useRef('');
  const isSubmittingRef = useRef(false);
  const userInitialRef = useRef('U'); // Default user initial
  
  // Auth context for user information
  const { currentUser } = useAuth();
  
  // Webhook URL for n8n
  const WEBHOOK_URL = "https://bluecraftleads.app.n8n.cloud/webhook/58a61a1c-ecab-43e9-ac4f-52664d6cfcb7/chat";

  // Initialize the chat interface
  useEffect(() => {
    // Generate a unique session ID
    sessionIdRef.current = generateSessionId();
    console.log('Generated session ID:', sessionIdRef.current);
    
    // Set user initial from current user
    setUserInitial();
    
    // Fetch the user's assistant ID
    fetchAssistantId();
    
    // Add welcome message
    addWelcomeMessage();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Cleanup function
    return () => {
      // Remove event listeners if needed
      if (sendButtonRef.current) {
        sendButtonRef.current.removeEventListener('click', handleSendButtonClick);
      }
      if (chatInputRef.current) {
        chatInputRef.current.removeEventListener('keydown', handleKeyDown);
        chatInputRef.current.removeEventListener('input', handleInput);
      }
    };
  }, []);

  // Set user initial from current user
  const setUserInitial = () => {
    if (currentUser) {
      // Try to get user's name from different possible properties
      const displayName = currentUser.displayName;
      const email = currentUser.email;
      const fullName = currentUser.fullName; // Custom property that might exist
      
      let initial = 'U'; // Default
      
      if (displayName && displayName.length > 0) {
        initial = displayName.charAt(0).toUpperCase();
      } else if (fullName && fullName.length > 0) {
        initial = fullName.charAt(0).toUpperCase();
      } else if (email && email.length > 0) {
        initial = email.charAt(0).toUpperCase();
      }
      
      userInitialRef.current = initial;
      console.log('Set user initial to:', initial);
    }
  };

  // Generate a unique session ID
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Fetch the user's assistant ID
  const fetchAssistantId = async () => {
    try {
      if (!currentUser) {
        showError('User not authenticated');
        return;
      }
      
      const assistant = await AssistantService.getUserAssistant();
      if (assistant && assistant.assistant_id) {
        assistantIdRef.current = assistant.assistant_id;
        console.log('Fetched assistant ID:', assistant.assistant_id);
      } else {
        showError('No assistant found for user');
      }
    } catch (err) {
      console.error('Error fetching assistant ID:', err);
      showError('Failed to fetch assistant ID');
    }
  };

  // Initialize event listeners
  const initializeEventListeners = () => {
    if (sendButtonRef.current) {
      sendButtonRef.current.addEventListener('click', handleSendButtonClick);
    }
    if (chatInputRef.current) {
      chatInputRef.current.addEventListener('keydown', handleKeyDown);
      chatInputRef.current.addEventListener('input', handleInput);
    }
  };

  // Handle send button click
  const handleSendButtonClick = () => {
    sendMessage();
  };

  // Handle key down in the input field
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle input in the textarea
  const handleInput = () => {
    autoResizeTextarea();
    updateSendButton();
  };

  // Auto-resize the textarea
  const autoResizeTextarea = () => {
    if (!chatInputRef.current) return;
    chatInputRef.current.style.height = 'auto';
    chatInputRef.current.style.height = Math.min(chatInputRef.current.scrollHeight, 200) + 'px';
  };

  // Update the send button state
  const updateSendButton = () => {
    if (!sendButtonRef.current || !chatInputRef.current) return;
    const hasText = chatInputRef.current.value.trim().length > 0;
    sendButtonRef.current.disabled = !hasText || isSubmittingRef.current;
    
    // Update button appearance based on state
    if (isSubmittingRef.current) {
      sendButtonRef.current.innerHTML = `
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;
    } else {
      sendButtonRef.current.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      `;
    }
  };

  // Add welcome message
  const addWelcomeMessage = () => {
    addMessage('assistant', 'Hello! I\'m your chat assistant. How can I help you today?');
  };

  // Add a message to the chat
  const addMessage = (sender, content, isTyping = false) => {
    if (!chatMessagesRef.current) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
    
    if (sender === 'assistant') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'w-8 h-8 rounded-full bg-secondary text-text-light flex items-center justify-center text-sm mr-2 flex-shrink-0';
      avatarDiv.textContent = 'AI';
      messageDiv.appendChild(avatarDiv);
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = `max-w-[70%] p-3 rounded-lg ${
      sender === 'user' 
        ? 'bg-secondary text-text-light rounded-br-sm' 
        : 'bg-gray-100 text-text-dark rounded-bl-sm'
    }`;
    
    if (isTyping) {
      contentDiv.innerHTML = `
        <div class="flex space-x-1 items-center py-2 px-1">
          <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0ms;"></div>
          <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 150ms;"></div>
          <div class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 300ms;"></div>
        </div>
      `;
    } else {
      const textDiv = document.createElement('div');
      textDiv.className = 'whitespace-pre-wrap';
      textDiv.textContent = content;
      contentDiv.appendChild(textDiv);
    }
    
    messageDiv.appendChild(contentDiv);
    
    if (sender === 'user') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'w-8 h-8 rounded-full bg-accent text-text-dark flex items-center justify-center text-sm ml-2 flex-shrink-0';
      avatarDiv.textContent = userInitialRef.current; // Use user's initial
      messageDiv.appendChild(avatarDiv);
    }
    
    chatMessagesRef.current.appendChild(messageDiv);
    scrollToBottom();
    
    return messageDiv;
  };

  // Show typing indicator
  const showTypingIndicator = () => {
    return addMessage('assistant', '', true);
  };

  // Remove typing indicator
  const removeTypingIndicator = (messageElement) => {
    if (messageElement && messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement);
    }
  };

  // Show error message
  const showError = (message) => {
    if (!chatMessagesRef.current) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-500 text-white p-3 text-center mb-4';
    errorDiv.textContent = message;
    chatMessagesRef.current.appendChild(errorDiv);
    scrollToBottom();
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Start a new conversation
  const startNewConversation = () => {
    // Generate new session ID
    sessionIdRef.current = generateSessionId();
    console.log('Started new conversation with session ID:', sessionIdRef.current);
    
    // Clear chat messages
    if (chatMessagesRef.current) {
      chatMessagesRef.current.innerHTML = '';
    }
    
    // Add welcome message
    addWelcomeMessage();
  };

  // Send a message
  const sendMessage = async () => {
    if (!chatInputRef.current) return;
    
    const message = chatInputRef.current.value.trim();
    if (!message || isSubmittingRef.current) return;
    
    // Add user message to chat
    addMessage('user', message);
    
    // Clear input
    chatInputRef.current.value = '';
    chatInputRef.current.style.height = 'auto';
    updateSendButton();
    
    // Show typing indicator
    const typingIndicator = showTypingIndicator();
    
    // Set submitting state
    isSubmittingRef.current = true;
    updateSendButton();
    
    try {
      // Check if we have the assistant ID
      if (!assistantIdRef.current) {
        throw new Error('Assistant ID not available');
      }
      
      // Prepare payload
      const payload = {
        assistant_id: assistantIdRef.current,
        conversationId: sessionIdRef.current,
        message: message
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
      removeTypingIndicator(typingIndicator);
      
      let botResponse = 'I received your message, but I\'m not sure how to respond.';
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        botResponse = 'Sorry, I encountered an error processing your request. Please try again.';
      } else {
        try {
          // Parse response
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
          
          // Extract the response message
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
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          botResponse = 'I received your message, but had trouble understanding the response.';
        }
      }
      
      // Add assistant response to chat
      addMessage('assistant', botResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator
      removeTypingIndicator(typingIndicator);
      
      // Show error message
      showError(error.message || 'Failed to send message');
      
      // Add error message to chat
      addMessage('assistant', 'Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      // Reset submitting state
      isSubmittingRef.current = false;
      updateSendButton();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Fixed Header Banner */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 px-4 py-3">
        <h1 className="text-2xl font-semibold text-black mb-3">AI Agent</h1>
        <button 
          onClick={startNewConversation}
          className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all mb-2"
        >
          New Conversation
        </button>
      </div>
      
      {/* Scrollable Message Area */}
      <div className="w-full px-4" 
           style={{ 
             paddingTop: "110px", // Adjust based on header height
             paddingBottom: "90px", // Adjust based on footer height
             minHeight: "100vh" 
           }}>
        <div ref={chatMessagesRef} className="space-y-4">
          {/* Messages will be added here dynamically */}
        </div>
      </div>
      
      {/* Fixed Footer Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-10 p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            ref={chatInputRef}
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            placeholder="Type your message here..."
            rows="1"
          ></textarea>
          <button
            ref={sendButtonRef}
            className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-secondary text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface; 