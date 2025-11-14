// src/components/company-navbar/CompanyNavbar.jsx
import { Link } from "react-router-dom";
import "./CompanyNavbar.css";

const CompanyNavbar = () => {
  return (
    <div className="company_navbar">
      <nav className="company_navbar_navbar">
        <Link to="/companydashboard/companydashboard" className="company_navbar_brand">
          Build & Beyond
        </Link>

        <div className="company_navbar_navLinks">
          <Link to="/companydashboard/companydashboard" className="company_navbar_navLink">
            Dashboard
          </Link>
          <Link to="/companydashboard/companybids" className="company_navbar_navLink">
            Bids
          </Link>
          <Link to="/companydashboard/companyongoing_projects" className="company_navbar_navLink">
            Ongoing Projects
          </Link>
          <Link to="/companydashboard/project_requests" className="company_navbar_navLink">
            Project Requests
          </Link>
          <Link to="/companydashboard/companyrevenue" className="company_navbar_navLink">
            Revenue
          </Link>
          <Link to="/companydashboard/companyhiring" className="company_navbar_navLink">
            Hire Now
          </Link>
          <Link to="/companydashboard/my-employees" className="company_navbar_navLink">
            My Employees
          </Link>
        </div>

        <div className="company_navbar_settingsContainer">
          <Link to="/companydashboard/companySettings" className="company_navbar_settingsBtn">
            <div className="company_navbar_settingsIcon">
              <svg
                className="company_navbar_settingsSvg"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CompanyNavbar;