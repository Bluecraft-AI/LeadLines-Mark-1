import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleReturn = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="text-center py-12">
      <h2 className="text-4xl font-bold text-text-dark mb-4">404</h2>
      <h3 className="text-2xl font-semibold text-text-dark mb-6">Page Not Found</h3>
      <p className="text-text-dark mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <button onClick={handleReturn} className="btn-primary">
        {currentUser ? 'Return to Dashboard' : 'Return to Home'}
      </button>
    </div>
  );
};

export default NotFound;
