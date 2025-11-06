// src/Pages/customer/components/customer-navbar/sub-components/Dropdown.jsx
import { Link } from "react-router-dom";
import "./Dropdown.css";

const Dropdown = () => {
  return (
    <div className="customer_dropdown">
      <span className="customer_dropdown_navLink">
        SERVICES
        <span className="customer_dropdown_arrow"></span> {/* ← No text */}
      </span>

      <div className="customer_dropdown_content">
        <Link
          to="/construction_companies_list"
          className="customer_dropdown_item"
        >
          Construction
        </Link>
        <Link to="/architect" className="customer_dropdown_item">
          Architect
        </Link>
        <Link to="/interior_designer" className="customer_dropdown_item">
          Interior Designer
        </Link>
      </div>
    </div>
  );
};

export default Dropdown;
