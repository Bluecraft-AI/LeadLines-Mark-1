import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      title: 'Job Posting Campaign',
      description: 'Find companies with active job postings and target them with your services',
      leads: 124,
      status: 'Active',
      createdAt: '2025-03-28'
    },
    {
      id: 2,
      title: 'LinkedIn Sales Navigator',
      description: 'Target decision makers based on LinkedIn profile criteria',
      leads: 87,
      status: 'Active',
      createdAt: '2025-03-30'
    },
    {
      id: 3,
      title: 'Conference Attendees',
      description: 'Reach out to attendees of industry conferences and events',
      leads: 53,
      status: 'Paused',
      createdAt: '2025-03-25'
    },
    {
      id: 1,
      title: 'Job Posting Campaign',
      description: 'Find companies with active job postings and target them with your services',
      leads: 124,
      status: 'Active',
      createdAt: '2025-03-28'
    },
    {
      id: 2,
      title: 'LinkedIn Sales Navigator',
      description: 'Target decision makers based on LinkedIn profile criteria',
      leads: 87,
      status: 'Active',
      createdAt: '2025-03-30'
    },
    {
      id: 3,
      title: 'Conference Attendees',
      description: 'Reach out to attendees of industry conferences and events',
      leads: 53,
      status: 'Paused',
      createdAt: '2025-03-25'
    },
    {
      id: 1,
      title: 'Job Posting Campaign',
      description: 'Find companies with active job postings and target them with your services',
      leads: 124,
      status: 'Active',
      createdAt: '2025-03-28'
    },
    {
      id: 2,
      title: 'LinkedIn Sales Navigator',
      description: 'Target decision makers based on LinkedIn profile criteria',
      leads: 87,
      status: 'Active',
      createdAt: '2025-03-30'
    },
    {
      id: 3,
      title: 'Conference Attendees',
      description: 'Reach out to attendees of industry conferences and events',
      leads: 53,
      status: 'Paused',
      createdAt: '2025-03-25'
    }
  ]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleInstantlyRedirect = () => {
    window.open('https://app.instantly.ai/app/dashboard', '_blank');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-text-dark">Dashboard</h2>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button 
          onClick={handleInstantlyRedirect}
          className="card bg-secondary text-text-light hover:bg-secondary-dark transition-colors flex flex-col items-center justify-center cursor-pointer"
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
          className="card bg-primary text-text-dark border border-gray-200 hover:bg-primary-dark transition-colors flex flex-col items-center justify-center cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(workflow => (
            <div key={workflow.id} className="card hover:shadow-lg transition-shadow">
              <h4 className="text-lg font-semibold text-text-dark mb-2">{workflow.title}</h4>
              <p className="text-gray-600 mb-4">{workflow.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Leads: {workflow.leads}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  workflow.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {workflow.status}
                </span>
              </div>
              <Link 
                to={`/workflow/${workflow.id}`} 
                className="btn-primary w-full block text-center"
              >
                Select Workflow
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
