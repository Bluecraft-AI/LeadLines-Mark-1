import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AirtableService from '../../services/AirtableService';

// Component for handling Airtable webhook integration
const SubmissionsPage = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch submissions from Airtable
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const status = selectedFilter !== 'all' ? selectedFilter : null;
      const data = await AirtableService.getSubmissions('Filter_Submissions', currentUser.uid, status);
      setSubmissions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again later.');
    } finally {
      setLoading(false);
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

  // Effect to fetch submissions on component mount and filter change
  useEffect(() => {
    if (currentUser) {
      fetchSubmissions();
    }
  }, [currentUser, selectedFilter]);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Submissions' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Done', label: 'Done' },
    { value: 'Error', label: 'Error' }
  ];

  // Handle filter change
  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  // Handle preview action
  const handlePreview = (submissionId) => {
    console.log(`Preview submission ${submissionId}`);
    // Implementation would open a modal with submission details
  };

  // Handle download action
  const handleDownload = (submissionId) => {
    console.log(`Download submission ${submissionId}`);
    // Implementation would generate and download a CSV file
  };

  // Handle upload action
  const handleUpload = (submissionId) => {
    console.log(`Upload submission ${submissionId} to Instantly`);
    // Implementation would open the mapping interface and upload to Instantly
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark">Submissions</h2>
        <div className="flex items-center">
          <label htmlFor="filter" className="mr-2 text-text-dark">Filter:</label>
          <select
            id="filter"
            value={selectedFilter}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
                <th className="py-3 px-4 text-left">Campaign Name</th>
                <th className="py-3 px-4 text-left">Workflow</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Created</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No submissions found. Start by creating a new campaign.
                  </td>
                </tr>
              ) : (
                submissions.map(submission => (
                  <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{submission.campaign_name || 'Unnamed Campaign'}</td>
                    <td className="py-3 px-4">{submission.workflow_type || 'Job Posting Campaign'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        submission.status === 'Done' 
                          ? 'bg-green-100 text-green-800' 
                          : submission.status === 'Error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status || 'Processing'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{submission.created_at || new Date().toISOString().split('T')[0]}</td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handlePreview(submission.id)}
                        className="text-secondary hover:text-opacity-80 mr-2"
                        disabled={submission.status !== 'Done'}
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => handleDownload(submission.id)}
                        className="text-secondary hover:text-opacity-80 mr-2"
                        disabled={submission.status !== 'Done'}
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => handleUpload(submission.id)}
                        className="text-green-600 hover:text-opacity-80"
                        disabled={submission.status !== 'Done'}
                      >
                        Upload
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
        <h3 className="text-lg font-semibold text-blue-800 mb-2">About Airtable Status Synchronization</h3>
        <p className="text-blue-800 mb-2">
          LeadLines uses Airtable automations to update the status of your submissions:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-blue-800">
          <li>When you submit a form, the status is set to "Processing"</li>
          <li>Airtable processes your submission through Clay's API</li>
          <li>When processing is complete, Airtable updates the status to "Done"</li>
          <li>If an error occurs, the status is updated to "Error"</li>
          <li>Status changes are automatically reflected in this dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default SubmissionsPage; 