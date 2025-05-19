import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/**
 * Chat interface component for interacting with the AI Assistant
 * @param {Object} props - Component props
 * @param {Object} props.assistant - The assistant object
 * @param {Object} props.thread - The thread object
 * @param {Function} props.onError - Error handler function
 */
const ChatInterface = ({ assistant, thread, onError }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const messagesEndRef = React.useRef(null);

  // Load messages when thread changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setInitialLoad(true);
        
        // Clear messages when thread changes
        setMessages([]);
        
        if (!thread) return;
        
        // Get messages for the thread
        const messagesData = await AssistantService.getMessages(thread.thread_id);
        setMessages(messagesData.reverse()); // Reverse to show newest at bottom
      } catch (err) {
        console.error('Error loading messages:', err);
        onError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    loadMessages();
  }, [thread, onError]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || loading) return;
    
    try {
      setLoading(true);
      
      // Add user message to UI immediately
      const userMessage = {
        id: `temp-${Date.now()}`,
        content: inputValue,
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // Send message to API
      await AssistantService.createMessage(thread.thread_id, inputValue);
      
      // Run the assistant
      await AssistantService.runAssistant(thread.thread_id, assistant.assistant_id);
      
      // Poll for completion and get messages
      const pollInterval = setInterval(async () => {
        try {
          const runStatus = await AssistantService.getRunStatus(thread.thread_id);
          
          if (runStatus === 'completed') {
            clearInterval(pollInterval);
            
            // Get updated messages
            const messagesData = await AssistantService.getMessages(thread.thread_id);
            setMessages(messagesData.reverse());
            setLoading(false);
          } else if (runStatus === 'failed' || runStatus === 'cancelled') {
            clearInterval(pollInterval);
            setLoading(false);
            onError('Assistant processing failed. Please try again later.');
          }
        } catch (err) {
          clearInterval(pollInterval);
          console.error('Error polling run status:', err);
          setLoading(false);
          onError('Failed to process your message. Please try again later.');
        }
      }, 1000);
    } catch (err) {
      console.error('Error sending message:', err);
      setLoading(false);
      onError('Failed to send message. Please try again later.');
    }
  };

  // Format message content
  const formatMessageContent = (content) => {
    if (!content) return '';
    
    // Handle different content types
    if (typeof content === 'string') {
      return content;
    } else if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === 'text') {
          return <p key={index}>{item.text.value}</p>;
        }
        return null;
      });
    }
    
    return JSON.stringify(content);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Thread title */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {thread?.name || 'New Conversation'}
      </Typography>
      
      {/* Messages area */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          mb: 2, 
          p: 2, 
          bgcolor: 'background.default', 
          borderRadius: 1 
        }}
      >
        {initialLoad ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation by sending a message.
            </Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Paper 
              key={message.id} 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2, 
                maxWidth: '80%', 
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                ml: message.role === 'user' ? 'auto' : 0,
                bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <Typography variant="body1">
                {formatMessageContent(message.content)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {new Date(message.created_at).toLocaleTimeString()}
              </Typography>
            </Paper>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input area */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleInputChange}
          disabled={loading}
          sx={{ mr: 1 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={loading || !inputValue.trim()}
          endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

// Import at the end to avoid circular dependencies
import AssistantService from '../../services/AssistantService';

export default ChatInterface; 