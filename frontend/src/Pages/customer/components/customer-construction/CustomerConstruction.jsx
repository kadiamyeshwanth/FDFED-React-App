/* eslint-disable react-hooks/exhaustive-deps */
// src/Pages/customer/components/customer-construction/CustomerConstruction.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerConstruction.css";

const CustomerConstruction = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const navigate = useNavigate();

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get("/api/construction_companies_list", {
          withCredentials: true,
        });
        setCompanies(res.data.companies || []);
      } catch (err) {
        setError("Failed to load companies. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Sort companies
  useEffect(() => {
    const sorted = [...companies].sort((a, b) => {
      if (sortBy === "name") {
        return a.companyName
          .toLowerCase()
          .localeCompare(b.companyName.toLowerCase());
      }
      if (sortBy === "projects") {
        return (b.projectsCompleted || 0) - (a.projectsCompleted || 0);
      }
      if (sortBy === "years") {
        return (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0);
      }
      return 0;
    });
    setCompanies(sorted);
  }, [sortBy]);

  // Back to Top
  useEffect(() => {
    const handleScroll = () => {
      const btn = document.querySelector(".construction-back-to-top");
      if (btn) {
        btn.classList.toggle("construction-visible", window.scrollY > 400);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ESC to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedCompany(null);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const showDetails = (companyId) => {
    setSelectedCompany(companies.find((c) => c._id === companyId));
    document.body.style.overflow = "hidden";
  };

  const closeDetails = () => {
    setSelectedCompany(null);
    document.body.style.overflow = "auto";
  };

  if (loading)
    return (
      <div className="construction-status-message construction-loading">
        Loading companies...
      </div>
    );
  if (error)
    return (
      <div className="construction-status-message construction-error">
        {error}
      </div>
    );

  return (
    <div className="construction-page">
      {/* Page Title */}
      <h1 className="construction-page-title">
        Hire Companies
        <div className="construction-underline"></div>
      </h1>

      {/* Sort Dropdown */}
      <div className="construction-sort-container">
        <select
          className="construction-sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="projects">Sort by Projects</option>
          <option value="years">Sort by Years</option>
        </select>
      </div>

      {/* Company Cards */}
      <div className="construction-company-container">
        {companies.length > 0 ? (
          companies.map((company) => (
            <div
              key={company._id}
              className="construction-company-card"
              data-id={company._id}
              data-name={company.companyName.toLowerCase()}
              data-projects={company.projectsCompleted || 0}
              data-years={company.yearsInBusiness || 0}
            >
              <div className="construction-company-name">
                {company.companyName}
              </div>

              <div className="construction-company-stats">
                <div className="construction-stat">
                  <span className="construction-stat-number">
                    {company.projectsCompleted || "0+"}
                  </span>
                  <span className="construction-stat-label">Projects</span>
                </div>
                <div className="construction-stat">
                  <span className="construction-stat-number">
                    {company.yearsInBusiness || "0"}
                  </span>
                  <span className="construction-stat-label">Years</span>
                </div>
              </div>

              <div className="construction-company-details">
                {company.aboutCompany ||
                  "Leading construction company with expertise in residential and commercial buildings, infrastructure development, and engineering services."}
              </div>

              <div className="construction-location">
                <i className="fas fa-map-marker-alt"></i>
                {company.location?.city
                  ? `${company.location.city}, India`
                  : "Location not specified, India"}
              </div>

              <div className="construction-buttons">
                <button
                  className="construction-view-details-btn"
                  onClick={() => showDetails(company._id)}
                >
                  View Details
                </button>
                <button
                  className="construction-book-now-btn"
                  onClick={() =>
                    navigate(
                      `/customerdashboard/constructionform?companyId=${company._id}`
                    )
                  }
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="construction-no-companies">
            <p>No construction companies found.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedCompany && (
        <div
          className="construction-details-overlay construction-active"
          onClick={closeDetails}
        >
          <div
            className="construction-details-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="construction-close-details"
              onClick={closeDetails}
            >
              <i className="fas fa-times"></i>
            </button>

            <h2 className="construction-detail-company-name">
              {selectedCompany.companyName}
            </h2>
            <p className="construction-detail-company-subtitle">
              {selectedCompany.contactPerson
                ? `${selectedCompany.contactPerson} - `
                : ""}
              Leading Engineering & Construction
            </p>

            <div className="construction-detail-section">
              <h3 className="construction-detail-section-title">
                Company Overview
              </h3>
              <div className="construction-detail-stats">
                <div className="construction-detail-stat">
                  <div className="construction-detail-stat-number">
                    {selectedCompany.projectsCompleted || "0+"}
                  </div>
                  <div className="construction-detail-stat-label">
                    Projects Completed
                  </div>
                </div>
                <div className="construction-detail-stat">
                  <div className="construction-detail-stat-number">
                    {selectedCompany.yearsInBusiness || "0"}
                  </div>
                  <div className="construction-detail-stat-label">
                    Years in Business
                  </div>
                </div>
                <div className="construction-detail-stat">
                  <div className="construction-detail-stat-number">
                    {selectedCompany.size || "N/A"}
                  </div>
                  <div className="construction-detail-stat-label">
                    Employees
                  </div>
                </div>
              </div>
              <p className="construction-detail-description">
                {selectedCompany.aboutForCustomers ||
                  "Company description not available."}
              </p>
            </div>

            {selectedCompany.teamMembers &&
              selectedCompany.teamMembers.length > 0 && (
                <div className="construction-detail-section">
                  <h3 className="construction-detail-section-title">
                    Key Team Members
                  </h3>
                  {selectedCompany.teamMembers.map((member, idx) => (
                    <div key={idx} className="construction-detail-team-member">
                      <img
                        src={member.image || "/api/placeholder/120/120"}
                        alt={member.name}
                        className="construction-member-image"
                      />
                      <div className="construction-member-info">
                        <h4 className="construction-member-name">
                          {member.name}
                        </h4>
                        <p className="construction-member-position">
                          {member.position}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {selectedCompany.completedProjects &&
              selectedCompany.completedProjects.length > 0 && (
                <div className="construction-detail-section">
                  <h3 className="construction-detail-section-title">
                    Completed Projects
                  </h3>
                  <div className="construction-detail-projects">
                    {selectedCompany.completedProjects.map((project, idx) => (
                      <div key={idx} className="construction-project-item">
                        <img
                          src={project.image || "/api/placeholder/120/120"}
                          alt={project.title}
                          className="construction-project-image"
                        />
                        <div className="construction-project-info">
                          <h4 className="construction-project-name">
                            {project.title}
                          </h4>
                          <p className="construction-project-description">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {selectedCompany.didYouKnow && (
              <div className="construction-detail-section">
                <h3 className="construction-detail-section-title">
                  Did You Know?
                </h3>
                <p className="construction-detail-description">
                  {selectedCompany.didYouKnow}
                </p>
              </div>
            )}

            <button
              className="construction-detail-book-now"
              onClick={() =>
                navigate(`/constructionform?companyId=${selectedCompany._id}`)
              }
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <a
        href="#"
        className="construction-back-to-top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <i className="fas fa-arrow-up"></i>
      </a>
    </div>
  );
};

export default CustomerConstruction;
