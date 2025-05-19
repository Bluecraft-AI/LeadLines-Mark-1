import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssistantService from '../../services/AssistantService';

/**
 * Component for uploading files to an assistant
 * @param {Object} props - Component props
 * @param {Object} props.assistant - The assistant object
 * @param {Function} props.onUploadComplete - Function to call when upload is complete
 */
const FileUpload = ({ assistant, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Upload file to assistant
      await AssistantService.uploadFileToAssistant(assistant.assistant_id, file);
      
      // Clear file and show success message
      setFile(null);
      setSuccess(true);
      
      // Call onUploadComplete callback
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Upload Files
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            accept=".pdf,.txt,.csv,.md,.json"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
              sx={{ mb: 1 }}
            >
              Select File
            </Button>
          </label>
          
          {file && (
            <Box sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: '100%' }}>
                {file.name}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={handleUpload}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 1, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 1, width: '100%' }}>
              File uploaded successfully!
            </Alert>
          )}
        </Box>
      </Paper>
      
      <Typography variant="caption" color="text.secondary">
        Supported files: PDF, TXT, CSV, MD, JSON
      </Typography>
    </Box>
  );
};

export default FileUpload; 