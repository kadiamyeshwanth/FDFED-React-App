// src/Pages/customer/components/customer-navbar/CustomerNavbar.jsx
import { Link } from "react-router-dom";
import Dropdown from "./sub-components/Dropdown";
// import NotificationIcon from "./sub-components/NotificationIcon";
import "./CustomerNavbar.css";

const CustomerNavbar = () => {
  return (
    <div className="customer_navbar">
      <nav className="customer_navbar_navbar">
        {/* Logo */}
        <Link to="/home" className="customer_navbar_logo">
          BUILD & BEYOND
        </Link>

        {/* Nav Links */}
        <div className="customer_navbar_navLinks">
          <div className="customer_navbar_navItem">
            <Link to="/home" className="customer_navbar_navLink">
              HOME
            </Link>
          </div>

          <Dropdown />

          <div className="customer_navbar_navItem">
            <Link to="/ongoing_projects" className="customer_navbar_navLink">
              ONGOING PROJECTS
            </Link>
          </div>

          <div className="customer_navbar_navItem">
            <Link to="/bidspace" className="customer_navbar_navLink">
              BIDSPACE
            </Link>
          </div>

          <div className="customer_navbar_navItem">
            <Link to="/design_ideas" className="customer_navbar_navLink">
              DESIGN IDEAS
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="customer_navbar_rightSection">
          {/* <NotificationIcon /> */}
          <div className="customer_navbar_profileIcon">
            <Link to="/customersettings">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CustomerNavbar;
