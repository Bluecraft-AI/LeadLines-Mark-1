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
    }
  ]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-text-dark">Workflow Dashboard</h2>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-200 text-text-dark rounded-md hover:bg-gray-300 transition-colors"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-secondary text-text-light">
          <h3 className="text-xl font-semibold mb-2">Active Workflows</h3>
          <p className="text-3xl font-bold">2</p>
        </div>
        <div className="card bg-accent text-text-dark">
          <h3 className="text-xl font-semibold mb-2">Total Leads Generated</h3>
          <p className="text-3xl font-bold">264</p>
        </div>
        <div className="card bg-primary text-text-dark border border-gray-200">
          <h3 className="text-xl font-semibold mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold">8.7%</p>
        </div>
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

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-text-dark mb-4">Your Recent Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 text-text-dark">
              <tr>
                <th className="py-3 px-4 text-left">Campaign Name</th>
                <th className="py-3 px-4 text-left">Workflow</th>
                <th className="py-3 px-4 text-left">Leads</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Created</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">Tech Startups Outreach</td>
                <td className="py-3 px-4">Job Posting Campaign</td>
                <td className="py-3 px-4">42</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4">2025-03-28</td>
                <td className="py-3 px-4">
                  <button className="text-secondary hover:text-opacity-80 mr-2">View</button>
                  <button className="text-red-500 hover:text-opacity-80">Pause</button>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">SaaS Decision Makers</td>
                <td className="py-3 px-4">LinkedIn Sales Navigator</td>
                <td className="py-3 px-4">35</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4">2025-03-30</td>
                <td className="py-3 px-4">
                  <button className="text-secondary hover:text-opacity-80 mr-2">View</button>
                  <button className="text-red-500 hover:text-opacity-80">Pause</button>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">Marketing Agencies</td>
                <td className="py-3 px-4">Conference Attendees</td>
                <td className="py-3 px-4">28</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Paused
                  </span>
                </td>
                <td className="py-3 px-4">2025-03-25</td>
                <td className="py-3 px-4">
                  <button className="text-secondary hover:text-opacity-80 mr-2">View</button>
                  <button className="text-green-500 hover:text-opacity-80">Resume</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
