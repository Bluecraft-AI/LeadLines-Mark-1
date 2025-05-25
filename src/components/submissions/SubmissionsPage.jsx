import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SubmissionsService from '../../services/SubmissionsService';

// Component for handling Airtable webhook integration
const SubmissionsPage = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editName, setEditName] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Fetch submissions from Supabase
  const fetchSubmissions = async () => {
    try {
      // Don't set loading to true if we're already initialized
      // This prevents the double loading spinner
      if (!initialized) {
        setLoading(true);
      }
      
      // Get current user
      if (!currentUser) {
        console.error('User not authenticated when fetching submissions');
        setError('Please log in to view your submissions');
        setLoading(false);
        return;
      }
      
      console.log('Fetching submissions for user:', currentUser.uid);
      
      // Get submissions directly from service
      const data = await SubmissionsService.getSubmissions();
      
      // Log all submissions for debugging
      console.log(`Retrieved ${data.length} submissions`);
      data.forEach((submission, index) => {
        console.log(`Submission ${index + 1}:`, submission);
      });
      
      // Always set submissions, even if empty
      setSubmissions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again later.');
      setSubmissions([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Setup webhook endpoint for Airtable status updates
  const setupWebhookEndpoint = () => {
    // This function would be implemented on the server side
    // It would create an API endpoint that Airtable can call when a record's status changes
    console.log('Setting up webhook endpoint for Airtable status updates');
  };

  // Handle webhook callback (simulated for client-side implementation)
  const handleStatusUpdate = (recordId, newStatus) => {
    setSubmissions(prev => 
      prev.map(submission => 
        submission.id === recordId 
          ? { ...submission, status: newStatus } 
          : submission
      )
    );
  };

  // Effect to fetch submissions on component mount and filter/search change
  useEffect(() => {
    if (currentUser) {
      fetchSubmissions();
    }
  }, [currentUser, selectedFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser && initialized) {
        fetchSubmissions();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Submissions' },
    { value: 'processing', label: 'Processing' },
    { value: 'done', label: 'Done' },
    { value: 'error', label: 'Error' }
  ];

  // Handle filter change
  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Start editing submission name
  const handleEditName = (submission) => {
    setEditingSubmission(submission.id);
    setEditName(submission.custom_name || submission.original_filename);
  };

  // Save edited submission name
  const handleSaveName = async (submissionId) => {
    try {
      if (!editName.trim()) {
        return;
      }
      
      await SubmissionsService.updateSubmissionName(submissionId, editName.trim());
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, custom_name: editName.trim() } 
            : sub
        )
      );
      
      setEditingSubmission(null);
    } catch (err) {
      console.error('Error updating submission name:', err);
      setError('Failed to update submission name. Please try again.');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setEditName('');
  };

  // Handle download action - FIXED: Use programmatic download instead of opening new tab
  const handleDownload = async (submission) => {
    try {
      let downloadUrl;
      
      // First check processed_file_path (preferred)
      if (submission.processed_file_path) {
        console.log('Using processed_file_path for download:', submission.processed_file_path);
        downloadUrl = await SubmissionsService.getFileDownloadUrl(submission.processed_file_path);
      }
      // Fallback to file_path if processed_file_path is not available
      else if (submission.file_path && submission.file_path !== 'NULL/MISSING') {
        console.log('Using file_path for download:', submission.file_path);
        const filePath = submission.file_path.startsWith('/') 
          ? submission.file_path.substring(1) 
          : submission.file_path;
          
        downloadUrl = await SubmissionsService.getFileDownloadUrl(filePath);
      }
      else {
        // If neither path is available
        console.error('No valid file path available for download');
        setError('Processed file not available for download yet.');
        return;
      }
      
      if (!downloadUrl) {
        console.error('Error getting file URL');
        setError('Failed to get download link. Please try again.');
        return;
      }
      
      // Create a temporary anchor element for direct download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', ''); // This triggers download instead of navigation
      link.setAttribute('target', '_self'); // Ensure it doesn't open in a new tab
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again later.');
    }
  };

  // Function to check if download is available
  const isDownloadAvailable = (submission) => {
    return submission.status === 'done' && (submission.processed_file_path || (submission.file_path && submission.file_path !== 'NULL/MISSING'));
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
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-text-dark">Submissions</h2>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary pr-8"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          
          {/* Filter dropdown */}
          <div className="flex items-center w-full md:w-auto">
            <label htmlFor="filter" className="mr-2 text-text-dark whitespace-nowrap">Filter:</label>
            <select
              id="filter"
              value={selectedFilter}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary w-full md:w-auto"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Refresh button */}
            <button 
              onClick={fetchSubmissions}
              className="ml-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 mb-4 rounded text-sm">
          <p>Debug: Found {submissions.length} submissions</p>
          <p>User ID: {currentUser?.uid || 'Not logged in'}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 text-text-dark">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Original File</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Created</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    {searchTerm 
                      ? 'No submissions match your search.' 
                      : 'No submissions found. Start by uploading a CSV file.'}
                  </td>
                </tr>
              ) : (
                submissions.map(submission => (
                  <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {editingSubmission === submission.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary w-full"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveName(submission.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{submission.custom_name || submission.original_filename}</span>
                          <button 
                            onClick={() => handleEditName(submission)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Edit name"
                          >
                            ✎
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{submission.original_filename}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        submission.status === 'done' 
                          ? 'bg-green-100 text-green-800' 
                          : submission.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status === 'processing' ? 'Processing' : 
                         submission.status === 'done' ? 'Done' : 'Error'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(submission.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handleDownload(submission)}
                        className={`text-secondary hover:text-opacity-80 ${
                          !isDownloadAvailable(submission) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!isDownloadAvailable(submission)}
                        title={!isDownloadAvailable(submission) ? 'Available when processing is complete' : 'Download processed file'}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">About CSV Processing</h3>
        <p className="text-blue-800 mb-2">
          LeadLines processes your CSV files through the following workflow:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-blue-800">
          <li>When you submit a CSV file, the status is set to "Processing"</li>
          <li>Your file is processed through our AI-powered system</li>
          <li>When processing is complete, the status is updated to "Done"</li>
          <li>If an error occurs, the status is updated to "Error"</li>
          <li>You can download the processed file once the status is "Done"</li>
          <li>You can edit the submission name at any time for better organization</li>
        </ol>
      </div>
    </div>
  );
};

export default SubmissionsPage;
