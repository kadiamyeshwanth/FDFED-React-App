import React, { useState, useEffect } from 'react';
import ProfileSection from './components/ProfileSection';
import AvailabilitySection from './components/AvailabilitySection';
import SecuritySection from './components/SecuritySection';
import LogoutSection from './components/LogoutSection';
import './Settings.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/worker/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch worker profile');
      }
      
      const data = await response.json();
      setWorker(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return <div className="settings-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="settings-container"><p className="error-message">Error: {error}</p></div>;
  }

  if (!worker) {
    return <div className="settings-container"><p>No worker data found</p></div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your professional profile and account preferences</p>
      </div>

      <div className="settings-grid">
        <div className="settings-sidebar">
          <ul className="settings-nav">
            <li>
              <a
                href="#profile"
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange('profile');
                }}
              >
                <i className="fas fa-user-circle"></i> Profile
              </a>
            </li>
            <li>
              <a
                href="#availability"
                className={activeTab === 'availability' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange('availability');
                }}
              >
                <i className="fas fa-calendar-check"></i> Availability
              </a>
            </li>
            <li>
              <a
                href="#security"
                className={activeTab === 'security' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange('security');
                }}
              >
                <i className="fas fa-lock"></i> Security
              </a>
            </li>
            <li>
              <a
                href="#logout"
                className={activeTab === 'logout' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange('logout');
                }}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </a>
            </li>
          </ul>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div id="profile" className="settings-section active">
              <ProfileSection worker={worker} />
            </div>
          )}

          {activeTab === 'availability' && (
            <div id="availability" className="settings-section active">
              <AvailabilitySection worker={worker} onAvailabilityUpdate={fetchWorkerProfile} />
            </div>
          )}

          {activeTab === 'security' && (
            <div id="security" className="settings-section active">
              <SecuritySection />
            </div>
          )}

          {activeTab === 'logout' && (
            <div id="logout" className="settings-section active">
              <LogoutSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
