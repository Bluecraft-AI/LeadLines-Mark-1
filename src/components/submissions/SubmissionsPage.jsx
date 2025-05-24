import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Grid, TextField, Typography, Card, CardContent, CardActions, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import SubmissionsService from '../../services/SubmissionsService';
import MappingModal from './MappingModal';
import { auth } from '../../config/firebase';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [newName, setNewName] = useState('');
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const user = auth.currentUser;
        if (!user) {
          console.error('User not authenticated when fetching submissions');
          setError('Please log in to view your submissions');
          setLoading(false);
          return;
        }
        
        console.log('Fetching submissions for user:', user.uid);
        const data = await SubmissionsService.getSubmissions();
        
        // Log all submissions for debugging
        console.log(`Retrieved ${data.length} submissions`);
        data.forEach((submission, index) => {
          console.log(`Submission ${index + 1}:`, submission);
        });
        
        // Always set submissions, even if empty
        setSubmissions(data || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions. Please try again later.');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!searchTerm.trim()) {
        // If search term is empty, fetch all submissions
        const data = await SubmissionsService.getSubmissions();
        setSubmissions(data || []);
      } else {
        // Search by name
        const data = await SubmissionsService.searchSubmissionsByName(searchTerm);
        setSubmissions(data || []);
      }
    } catch (err) {
      console.error('Error searching submissions:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditName = (submission) => {
    setEditingSubmission(submission);
    setNewName(submission.custom_name || submission.original_filename);
  };

  const handleSaveName = async () => {
    if (!editingSubmission || !newName.trim()) return;
    
    try {
      setLoading(true);
      await SubmissionsService.updateSubmissionName(editingSubmission.id, newName);
      
      // Update the submission in the local state
      setSubmissions(submissions.map(sub => 
        sub.id === editingSubmission.id ? { ...sub, custom_name: newName } : sub
      ));
      
      setEditingSubmission(null);
      setNewName('');
    } catch (err) {
      console.error('Error updating submission name:', err);
      setError('Failed to update name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setNewName('');
  };

  const handleOpenMappingModal = (submission) => {
    setSelectedSubmission(submission);
    setMappingModalOpen(true);
  };

  const handleCloseMappingModal = () => {
    setMappingModalOpen(false);
    setSelectedSubmission(null);
  };

  const handleDownload = async (submission) => {
    try {
      // Check if file path exists and is not NULL/MISSING
      if (!submission.file_path || submission.file_path === 'NULL/MISSING') {
        console.error('File path is missing or null');
        setError(`Cannot download: File is still being processed or unavailable.`);
        return;
      }
      
      // Normalize file path if needed
      const filePath = submission.file_path.startsWith('/') 
        ? submission.file_path.substring(1) 
        : submission.file_path;
      
      // Get download URL
      const downloadUrl = await SubmissionsService.getFileDownloadUrl(filePath);
      
      if (!downloadUrl) {
        console.error('Error getting file URL');
        setError('Failed to get download link. Please try again.');
        return;
      }
      
      // Open download in new tab
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Download failed. Please try again later.');
    }
  };

  // Function to render status with appropriate styling
  const renderStatus = (status) => {
    let color = 'inherit';
    
    switch (status?.toLowerCase()) {
      case 'processing':
        color = 'orange';
        break;
      case 'done':
        color = 'green';
        break;
      case 'error':
        color = 'red';
        break;
      default:
        color = 'inherit';
    }
    
    return (
      <Typography variant="body2" color={color} fontWeight="bold">
        {status || 'Unknown'}
      </Typography>
    );
  };

  // Function to safely get file name from path
  const getFileNameFromPath = (path) => {
    if (!path || path === 'NULL/MISSING') {
      return 'Processing...';
    }
    
    try {
      // Extract filename from path
      const parts = path.split('/');
      return parts[parts.length - 1];
    } catch (err) {
      console.error('Error parsing file path:', err);
      return 'Unknown file';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Submissions
      </Typography>
      
      {/* Search bar */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search by name"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      
      {/* Error message */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* No submissions message */}
      {!loading && submissions.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6">No submissions found</Typography>
          <Typography variant="body1" color="textSecondary">
            Upload a CSV file to get started
          </Typography>
        </Box>
      )}
      
      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2">Debug Info:</Typography>
          <Typography variant="body2">Submissions count: {submissions.length}</Typography>
          <Typography variant="body2">User ID: {auth.currentUser?.uid || 'Not logged in'}</Typography>
        </Box>
      )}
      
      {/* Submissions grid */}
      <Grid container spacing={3}>
        {submissions.map((submission) => (
          <Grid item xs={12} sm={6} md={4} key={submission.id}>
            <StyledCard>
              <CardContent>
                {/* Display submission name with edit functionality */}
                {editingSubmission?.id === submission.id ? (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="New name"
                      variant="outlined"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      size="small"
                    />
                  </Box>
                ) : (
                  <Typography variant="h6" component="div" gutterBottom noWrap title={submission.custom_name || submission.original_filename}>
                    {submission.custom_name || submission.original_filename}
                  </Typography>
                )}
                
                {/* Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                    Status:
                  </Typography>
                  {renderStatus(submission.status)}
                </Box>
                
                {/* Original filename if different from custom name */}
                {submission.custom_name && submission.custom_name !== submission.original_filename && (
                  <Typography variant="body2" color="textSecondary" noWrap title={submission.original_filename}>
                    Original: {submission.original_filename}
                  </Typography>
                )}
                
                {/* File path - show processing if null */}
                <Typography variant="body2" color="textSecondary" noWrap>
                  File: {getFileNameFromPath(submission.file_path)}
                </Typography>
                
                {/* Date */}
                <Typography variant="body2" color="textSecondary">
                  Uploaded: {new Date(submission.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ mt: 'auto', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                {/* Edit/Save name buttons */}
                {editingSubmission?.id === submission.id ? (
                  <>
                    <Button size="small" onClick={handleSaveName}>Save</Button>
                    <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <Button size="small" onClick={() => handleEditName(submission)}>
                    Edit Name
                  </Button>
                )}
                
                {/* Download button - disabled if file_path is null */}
                <Button 
                  size="small" 
                  onClick={() => handleDownload(submission)}
                  disabled={!submission.file_path || submission.file_path === 'NULL/MISSING' || submission.status === 'processing'}
                >
                  Download
                </Button>
                
                {/* Mapping button */}
                <Button size="small" onClick={() => handleOpenMappingModal(submission)}>
                  Mapping
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      
      {/* Mapping modal */}
      {selectedSubmission && (
        <MappingModal
          open={mappingModalOpen}
          onClose={handleCloseMappingModal}
          submission={selectedSubmission}
        />
      )}
    </Container>
  );
};

export default SubmissionsPage; 