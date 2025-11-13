import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WorkerNavbar.css';

const WorkerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }

    // Determine active page based on current route
    const path = location.pathname;
    if (path.includes('dashboard')) {
      setActivePage('dashboard');
    } else if (path.includes('jobs')) {
      setActivePage('jobs');
    } else if (path.includes('join-company')) {
      setActivePage('join');
    } else if (path.includes('ongoing')) {
      setActivePage('ongoing');
    } else if (path.includes('my-company')) {
      setActivePage('my-company');
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const profileImage = user?.profileImage || 'https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg';

  return (
    <nav className="navbar">
      <a href="/worker/dashboard" className="navbar-left">
        <i className="fas fa-building"></i> Build & Beyond
      </a>

      <div className="navbar-middle">
        <button
          className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavigation('/worker/dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`nav-link ${activePage === 'jobs' ? 'active' : ''}`}
          onClick={() => handleNavigation('/worker/jobs')}
        >
          New Jobs
        </button>
        <button
          className={`nav-link ${activePage === 'join' ? 'active' : ''}`}
          onClick={() => handleNavigation('/worker/join-company')}
        >
          Join a Company
        </button>
        <button
          className={`nav-link ${activePage === 'ongoing' ? 'active' : ''}`}
          onClick={() => handleNavigation('/worker/ongoing-projects')}
        >
          Ongoing Projects
        </button>
        <button
          className={`nav-link ${activePage === 'my-company' ? 'active' : ''}`}
          onClick={() => handleNavigation('/worker/my-company')}
        >
          My Company
        </button>
      </div>

      <div className="navbar-right">
        <div
          className="profile-icon"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img src={profileImage} alt="Profile" title={user?.name || 'User'} />
        </div>

        {isDropdownOpen && (
          <div className="profile-dropdown">
            <div className="profile-dropdown-content">
              <button
                className="dropdown-link"
                onClick={() => handleNavigation('/worker/settings')}
              >
                <i className="fas fa-user-circle"></i> Profile
              </button>
              <button
                className="dropdown-link"
                onClick={() => handleNavigation('/worker/settings')}
              >
                <i className="fas fa-calendar-check"></i> Availability
              </button>
              <button
                className="dropdown-link"
                onClick={() => handleNavigation('/worker/settings')}
              >
                <i className="fas fa-lock"></i> Security
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-link logout-link" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {isDropdownOpen && (
        <div
          className="navbar-backdrop"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default WorkerNavbar;
