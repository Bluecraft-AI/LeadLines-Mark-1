import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Fallback implementation if imports fail
let WorkflowService;
try {
  WorkflowService = require('../../services/WorkflowService').default;
} catch (error) {
  console.error('Error importing WorkflowService:', error);
  // Mock service to prevent fatal errors
  WorkflowService = {
    getUserWorkflowCounts: async () => [],
    incrementSubmissionCount: async () => true,
    updateProcessingStatus: async () => true
  };
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      title: 'Job Posting Campaign',
      description: 'Find companies with active job postings and target them with your services',
      submissions: 0,
      hasProcessing: false,
      createdAt: '2025-03-28'
    },
    {
      id: 2,
      title: 'Coming soon...',
      description: 'Currently in development',
      submissions: 0,
      hasProcessing: false,
      createdAt: '2025-03-30'
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user-specific workflow submission counts
  useEffect(() => {
    const fetchUserSubmissionCounts = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's workflow submission counts with error handling
        const userWorkflowCounts = await WorkflowService.getUserWorkflowCounts(currentUser.uid);
        
        // Update workflows with user-specific submission counts
        if (userWorkflowCounts && userWorkflowCounts.length > 0) {
          const updatedWorkflows = workflows.map(workflow => {
            const userWorkflowData = userWorkflowCounts.find(item => item.workflow_id === workflow.id);
            
            if (userWorkflowData) {
              return {
                ...workflow,
                submissions: userWorkflowData.submission_count || 0,
                hasProcessing: userWorkflowData.has_processing || false
              };
            }
            
            return workflow;
          });
          
          setWorkflows(updatedWorkflows);
        }
      } catch (error) {
        console.error('Error in fetchUserSubmissionCounts:', error);
        setError('Failed to load workflow data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSubmissionCounts();
  }, [currentUser]);

  const handleInstantlyRedirect = () => {
    window.open('https://app.instantly.ai/app/dashboard', '_blank');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-dark">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button 
          onClick={handleInstantlyRedirect}
          className="card bg-accent text-text-dark hover:bg-accent-dark transition-colors flex flex-col items-center justify-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <h3 className="text-xl font-semibold mb-1">Access Instantly Account</h3>
          <p className="text-sm text-center">Open your Instantly dashboard in a new tab</p>
        </button>

        <Link 
          to="/email-submission" 
          className="card bg-accent text-text-dark hover:bg-accent-dark transition-colors flex flex-col items-center justify-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold mb-1">Email Account Submission</h3>
          <p className="text-sm text-center">Submit your email account details</p>
        </Link>

        <Link 
          to="/schedule-call" 
          className="card bg-accent text-text-dark hover:bg-accent-dark transition-colors flex flex-col items-center justify-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold mb-1">Schedule a Call</h3>
          <p className="text-sm text-center">Book a consultation with our team</p>
        </Link>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-text-dark mb-4">Available Workflows</h3>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(workflow => (
              <div key={workflow.id} className="card hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-text-dark mb-2">{workflow.title}</h4>
                  <p className="text-gray-600 mb-4">{workflow.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Submissions: {workflow.submissions}</span>
                    {workflow.hasProcessing && (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Processing
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <Link 
                    to={`/workflow/${workflow.id}`} 
                    className="btn-primary w-full block text-center"
                  >
                    Select Workflow
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
