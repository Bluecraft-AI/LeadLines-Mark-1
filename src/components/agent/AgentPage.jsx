import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import AssistantService from '../../services/AssistantService';
import ChatInterface from './ChatInterface';
import FileUpload from './FileUpload';
import ThreadList from './ThreadList';

/**
 * Main component for the AI Agent page
 */
const AgentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assistant, setAssistant] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load assistant and threads on component mount
  useEffect(() => {
    const loadAssistantData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's assistant
        const assistantData = await AssistantService.getUserAssistant();
        setAssistant(assistantData);
        
        // If assistant exists, get threads
        if (assistantData) {
          const threadsData = await AssistantService.getThreads();
          setThreads(threadsData);
          
          // Set active thread to the most recent one if available
          if (threadsData.length > 0) {
            setActiveThread(threadsData[0]);
          }
        }
      } catch (err) {
        console.error('Error loading assistant data:', err);
        setError('Failed to load AI Assistant. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAssistantData();
  }, [refreshKey]);

  // Create a new thread
  const handleCreateThread = async () => {
    try {
      setLoading(true);
      const result = await AssistantService.createThread();
      
      // Refresh threads list
      const threadsData = await AssistantService.getThreads();
      setThreads(threadsData);
      
      // Find and set the newly created thread as active
      const newThread = threadsData.find(t => t.thread_id === result.threadId);
      if (newThread) {
        setActiveThread(newThread);
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create a new conversation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle thread selection
  const handleSelectThread = (thread) => {
    setActiveThread(thread);
  };

  // Handle thread deletion
  const handleDeleteThread = async (threadId) => {
    try {
      await AssistantService.deleteThread(threadId);
      
      // Refresh threads list
      const threadsData = await AssistantService.getThreads();
      setThreads(threadsData);
      
      // If active thread was deleted, set to null or the first available thread
      if (activeThread && activeThread.thread_id === threadId) {
        setActiveThread(threadsData.length > 0 ? threadsData[0] : null);
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      setError('Failed to delete conversation. Please try again later.');
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Render loading state
  if (loading && !assistant && !activeThread) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Try Again
        </Button>
      </Box>
    );
  }

  // Render when no assistant is available
  if (!assistant) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            AI Assistant Not Available
          </Typography>
          <Typography variant="body1" paragraph>
            Could not find an AI Assistant associated with your account. Please contact support.
          </Typography>
          <Button variant="contained" onClick={handleRefresh}>
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', p: 2 }}>
      {/* Left sidebar with threads list */}
      <Box sx={{ width: 300, mr: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Conversations</Typography>
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleCreateThread}
            disabled={loading}
          >
            New
          </Button>
        </Box>
        
        <ThreadList 
          threads={threads} 
          activeThread={activeThread} 
          onSelectThread={handleSelectThread} 
          onDeleteThread={handleDeleteThread}
        />
        
        <Divider sx={{ my: 2 }} />
        
        <FileUpload 
          assistant={assistant} 
          onUploadComplete={handleRefresh}
        />
      </Box>
      
      {/* Main chat area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 1 }}>
        {activeThread ? (
          <ChatInterface 
            assistant={assistant}
            thread={activeThread}
            onError={setError}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              Select a conversation or create a new one to get started.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AgentPage;
