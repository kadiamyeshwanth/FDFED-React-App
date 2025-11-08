import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavbarCompany.css';

const NavbarCompany = () => {
  const location = useLocation();

  // Helper to determine active link
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/companydashboard">Build & Beyond</Link>
      </div>

      <div className="nav-links">
        <Link
          to="/companydashboard"
          className={isActive('/companydashboard')}
        >
          Dashboard
        </Link>
        <Link
          to="/companybids"
          className={isActive('/companybids')}
        >
          Bids
        </Link>
        <Link
          to="/companyongoing_projects"
          className={isActive('/companyongoing_projects')}
        >
          Ongoing Projects
        </Link>
        <Link
          to="/project_requests"
          className={isActive('/project_requests')}
        >
          Project Requests
        </Link>
        <Link
          to="/companyrevenue"
          className={isActive('/companyrevenue')}
        >
          Revenue
        </Link>
        <Link
          to="/companyhiring"
          className={isActive('/companyhiring')}
        >
          Hire Now
        </Link>
        <Link
          to="/my-employees"
          className={isActive('/my-employees')}
        >
          My Employees
        </Link>
      </div>

      <div className="nav_settings-container">
        <Link to="/companysettings" className="nav_settings-btn">
          <div className="nav_settings-icon">
            <svg
              className="nav_settings-svg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default NavbarCompany;