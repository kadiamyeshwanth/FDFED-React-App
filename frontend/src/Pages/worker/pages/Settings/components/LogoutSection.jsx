import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutSection = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out of your account?')) {
      return;
    }

    setIsLoggingOut(true);

    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Call logout endpoint to clear server-side session
      try {
        await fetch('/logout', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (err) {
        console.log('Logout endpoint not available, proceeding with client-side logout');
      }

      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="logout-content">
      <h2>Logout</h2>
      <p className="logout-description">
        Are you sure you want to log out of your account? You will need to sign in again to access your profile.
      </p>

      <div className="logout-warning">
        <i className="fas fa-exclamation-circle"></i>
        <p>This action will end your current session.</p>
      </div>

      <button
        onClick={handleLogout}
        className="btn btn-danger"
        disabled={isLoggingOut}
        style={{ marginTop: '2rem' }}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>

      <div className="logout-info">
        <h4>Before you go</h4>
        <ul>
          <li>Make sure you have saved all your work</li>
          <li>You can log back in anytime with your credentials</li>
          <li>Your profile and projects will be safe</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoutSection;
