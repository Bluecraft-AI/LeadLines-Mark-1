import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AssistantService from '../../services/AssistantService';

/**
 * ChatbotInterface component for the LeadLines AI Agent section
 * Redesigned with sticky header/footer and scrollable message area
 * Optimized for proper layout within the application
 * Updated to respect parent container boundaries
 * Removed shadows and borders for transparent look
 * Improved scroll behavior to only show when needed
 */
const ChatbotInterface = () => {
  // DOM References
  const chatMessagesRef = useRef(null);
  const chatInputRef = useRef(null);
  const sendButtonRef = useRef(null);
  const containerRef = useRef(null);
  const messageContainerRef = useRef(null);
  
  // State for scroll visibility
  const [showScroll, setShowScroll] = useState(false);
  
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
    
    // Set up scroll check
    checkScrollNeeded();
    
    // Set up resize observer to check scroll when window resizes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollNeeded();
    });
    
    if (messageContainerRef.current) {
      resizeObserver.observe(messageContainerRef.current);
    }
    
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
      
      // Disconnect resize observer
      resizeObserver.disconnect();
    };
  }, []);
  
  // Check if scroll is needed
  const checkScrollNeeded = () => {
    if (messageContainerRef.current && chatMessagesRef.current) {
      const container = messageContainerRef.current;
      const content = chatMessagesRef.current;
      
      // Get the available height for content (container height minus padding)
      const containerStyle = window.getComputedStyle(container);
      const paddingTop = parseInt(containerStyle.paddingTop);
      const paddingBottom = parseInt(containerStyle.paddingBottom);
      const availableHeight = container.clientHeight - paddingTop - paddingBottom;
      
      // Get the actual content height
      const contentHeight = content.scrollHeight;
      
      console.log('Scroll check:', { 
        containerHeight: container.clientHeight,
        paddingTop,
        paddingBottom,
        availableHeight,
        contentHeight,
        needsScroll: contentHeight > availableHeight 
      });
      
      // Only show scroll if content is taller than available space
      setShowScroll(contentHeight > availableHeight);
    }
  };

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
    chatInputRef.current.style.height = Math.min(chatInputRef.current.scrollHeight, 80) + 'px';
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

  // Convert Markdown links to HTML hyperlinks
  const convertMarkdownLinksToHtml = (text) => {
    // Handle non-string inputs
    if (typeof text !== 'string') {
      return text;
    }
    
    // Convert Markdown links [text](url) to HTML <a> tags
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let convertedText = text.replace(markdownLinkRegex, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>');
    
    // Convert ![alt](url) to clickable thumbnail images
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    convertedText = convertedText.replace(markdownImageRegex, 
      '<img src="$2" alt="$1" class="max-w-[150px] h-auto rounded cursor-pointer hover:opacity-80 transition-opacity my-2 block" onclick="window.open(\'$2\', \'_blank\')" title="Click to view full size" style="max-width: 150px; height: auto;" />'
    );
    
    // Convert **bold** text to HTML
    convertedText = convertedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert _italic_ text to HTML
    convertedText = convertedText.replace(/\_([^_]+)\_/g, '<em>$1</em>');
    
    // Convert *italic* text to HTML (alternative markdown syntax)
    convertedText = convertedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convert line breaks to HTML
    convertedText = convertedText.replace(/\n/g, '<br>');
    
    return convertedText;
  };

  // Format structured data (arrays/objects) into readable HTML
  const formatStructuredData = (data) => {
    if (Array.isArray(data)) {
      // Handle array of news articles or similar structured data
      // Convert to simple clickable text format instead of fancy cards
      let text = '';
      
      data.forEach((item, index) => {
        if (typeof item === 'object' && item.title && item.link) {
          // Simple news article format - just clickable title with source info
          text += `${index + 1}. [${item.title}](${item.link})`;
          if (item.source) {
            text += ` - ${item.source}`;
            if (item.date) {
              text += ` (${item.date})`;
            }
          }
          text += '\n\n';
        } else {
          // Generic array item
          text += `${index + 1}. ${typeof item === 'string' ? item : JSON.stringify(item)}\n\n`;
        }
      });
      
      // Convert the markdown-style text to HTML with clickable links
      return convertMarkdownLinksToHtml(text.trim());
    } else if (typeof data === 'object') {
      // Handle single object
      if (data.title && data.link) {
        // Simple single article format
        let text = `[${data.title}](${data.link})`;
        if (data.source) {
          text += ` - ${data.source}`;
          if (data.date) {
            text += ` (${data.date})`;
          }
        }
        return convertMarkdownLinksToHtml(text);
      } else {
        // Generic object
        return `<pre class="bg-gray-100 p-2 rounded text-sm overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>`;
      }
    }
    
    return String(data);
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
      
      // For assistant messages, handle different content types
      if (sender === 'assistant') {
        let htmlContent;
        if (typeof content === 'string') {
          htmlContent = convertMarkdownLinksToHtml(content);
        } else {
          // Handle structured data (arrays, objects)
          htmlContent = formatStructuredData(content);
        }
        
        // Use innerHTML to render HTML content properly
        textDiv.innerHTML = htmlContent;
      } else {
        // For user messages, use textContent to prevent HTML injection
        textDiv.textContent = content;
      }
      
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
    
    // Check if scroll is needed after adding message
    setTimeout(checkScrollNeeded, 0);
    
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
      
      // Check if scroll is needed after removing typing indicator
      setTimeout(checkScrollNeeded, 0);
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
    
    // Check if scroll is needed after adding error
    setTimeout(checkScrollNeeded, 0);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
        
        // Check if scroll is needed after removing error
        setTimeout(checkScrollNeeded, 0);
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
    
    // Check if scroll is needed after resetting conversation
    setTimeout(checkScrollNeeded, 0);
  };

  // Process API response with improved JSON handling
  const processApiResponse = async (response) => {
    try {
      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
        
        // Handle array responses (like the n8n webhook format)
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          parsedData = parsedData[0]; // Use the first element
        }
        
        // Check if it's in the expected format: {"response": "message"}
        if (parsedData && typeof parsedData === 'object' && parsedData.response) {
          return parsedData.response;
        }
        
        // Handle nested JSON in output field (common in n8n responses)
        if (parsedData && parsedData.output) {
          // If output is a string, try to parse it as JSON
          if (typeof parsedData.output === 'string') {
            try {
              const nestedData = JSON.parse(parsedData.output);
              
              // Check for response field (primary)
              if (nestedData && nestedData.response) {
                return nestedData.response;
              }
              
              // Check for message field (backup for legacy responses)
              if (nestedData && nestedData.message) {
                return nestedData.message;
              }
              
              // If nested JSON doesn't have expected fields, return as string
              return typeof nestedData === 'string' ? nestedData : JSON.stringify(nestedData);
              
            } catch (nestedJsonError) {
              console.log('Output field is not valid JSON, treating as plain text');
              return parsedData.output; // Return as plain text
            }
          } else if (typeof parsedData.output === 'object') {
            // If output is already an object
            
            // Check for response field (primary)
            if (parsedData.output.response) {
              return parsedData.output.response;
            }
            
            // Check for message field (backup for legacy responses)
            if (parsedData.output.message) {
              return parsedData.output.message;
            }
            
            // If no expected fields, return the object as string
            return JSON.stringify(parsedData.output);
          } else {
            // If output is neither string nor object, return it as is
            return String(parsedData.output);
          }
        }
        
        // Simple fallback for direct message fields
        if (parsedData.message) {
          return parsedData.message;
        }
        
        // If no recognized structure, return the entire response as formatted JSON
        return JSON.stringify(parsedData, null, 2);
        
      } catch (jsonError) {
        // If JSON parsing fails, treat as plain text
        console.log('JSON parsing failed, treating as plain text:', jsonError.message);
        
        // Return as plain text
        const cleanedText = responseText.trim();
        return cleanedText || 'I received your message, but the response was empty.';
      }
      
    } catch (error) {
      console.error('Error processing API response:', error);
      return 'I received your message, but had trouble processing the response.';
    }
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
        // Process the response with improved JSON handling
        botResponse = await processApiResponse(response);
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
    <div ref={containerRef} className="relative w-full h-full" style={{ position: 'relative' }}>
      {/* Sticky Header - No shadows or borders, extends fully to container edges */}
      <div className="bg-white z-10 px-4 py-3 w-full m-0" 
           style={{ 
             position: 'sticky', 
             top: 0,
             marginTop: '-1px', // Eliminate gap at top
             paddingTop: 'calc(0.75rem + 1px)', // Compensate for negative margin
             boxShadow: '0 -20px 0 0 white' // White coverage above top banner only
           }}>
        <h1 className="text-2xl font-semibold text-black mb-3">AI Agent</h1>
        <button 
          onClick={startNewConversation}
          className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all mb-2"
        >
          New Conversation
        </button>
      </div>
      
      {/* Scrollable Message Area - Scroll only appears when needed */}
      <div 
        ref={messageContainerRef}
        className="w-full px-4" 
        style={{ 
          paddingTop: "20px",
          paddingBottom: "90px", // Adjust based on footer height
          minHeight: "calc(100vh - 200px)", // Ensure minimum height for content
          overflowY: showScroll ? "auto" : "hidden",
          overflowX: "hidden"
        }}>
        <div ref={chatMessagesRef} className="space-y-4">
          {/* Messages will be added here dynamically */}
        </div>
      </div>
      
      {/* Sticky Footer - No shadows or borders, extends fully to container edges */}
      <div className="bg-white z-10 p-4 w-full m-0" 
           style={{ 
             position: 'sticky', 
             bottom: 0,
             marginBottom: '-1px', // Eliminate gap at bottom
             paddingBottom: 'calc(1rem + 1px)', // Compensate for negative margin
             boxShadow: '0 20px 0 0 white' // White coverage below bottom banner only
           }}>
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