import React from 'react';
import { Box, List, ListItem, ListItemText, ListItemButton, ListItemSecondaryAction, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';

/**
 * Component for displaying a list of threads
 * @param {Object} props - Component props
 * @param {Array} props.threads - Array of thread objects
 * @param {Object} props.activeThread - Currently active thread
 * @param {Function} props.onSelectThread - Function to call when a thread is selected
 * @param {Function} props.onDeleteThread - Function to call when a thread is deleted
 */
const ThreadList = ({ threads, activeThread, onSelectThread, onDeleteThread }) => {
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle thread deletion
  const handleDelete = (e, threadId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDeleteThread(threadId);
    }
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      {threads.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No conversations yet. Click "New" to start.
          </Typography>
        </Box>
      ) : (
        <List>
          {threads.map((thread) => (
            <ListItem 
              key={thread.id} 
              disablePadding
              sx={{ 
                mb: 0.5,
                bgcolor: activeThread && activeThread.thread_id === thread.thread_id 
                  ? 'action.selected' 
                  : 'transparent',
                borderRadius: 1
              }}
            >
              <ListItemButton 
                onClick={() => onSelectThread(thread)}
                sx={{ borderRadius: 1 }}
              >
                <ChatIcon sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText 
                  primary={thread.name || 'Untitled Conversation'} 
                  secondary={formatDate(thread.created_at)}
                  primaryTypographyProps={{
                    noWrap: true,
                    style: { maxWidth: '180px' }
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => handleDelete(e, thread.thread_id)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ThreadList; 