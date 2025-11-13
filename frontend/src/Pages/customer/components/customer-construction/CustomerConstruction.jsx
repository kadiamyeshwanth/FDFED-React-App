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
      const btn = document.querySelector(".back-to-top");
      if (btn) {
        btn.classList.toggle("visible", window.scrollY > 400);
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
    return <div className="status-message">Loading companies...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="construction-page">
      {/* Page Title */}
      <h1 className="page-title">
        Hire Companies
        <div className="underline"></div>
      </h1>

      {/* Sort Dropdown */}
      <div className="sort-container">
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="projects">Sort by Projects</option>
          <option value="years">Sort by Years</option>
        </select>
      </div>

      {/* Company Cards */}
      <div className="company-container">
        {companies.length > 0 ? (
          companies.map((company) => (
            <div
              key={company._id}
              className="company-card"
              data-id={company._id}
              data-name={company.companyName.toLowerCase()}
              data-projects={company.projectsCompleted || 0}
              data-years={company.yearsInBusiness || 0}
            >
              <div className="company-name">{company.companyName}</div>

              <div className="company-stats">
                <div className="stat">
                  <span className="stat-number">
                    {company.projectsCompleted || "0+"}
                  </span>
                  <span className="stat-label">Projects</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {company.yearsInBusiness || "0"}
                  </span>
                  <span className="stat-label">Years</span>
                </div>
              </div>

              <div className="company-details">
                {company.aboutCompany ||
                  "Leading construction company with expertise in residential and commercial buildings, infrastructure development, and engineering services."}
              </div>

              <div className="location">
                <i className="fas fa-map-marker-alt"></i>
                {company.location?.city
                  ? `${company.location.city}, India`
                  : "Location not specified, India"}
              </div>

              <div className="buttons">
                <button
                  className="view-details-btn"
                  onClick={() => showDetails(company._id)}
                >
                  View Details
                </button>
                <button
                  className="book-now-btn"
                  onClick={() =>
                    navigate(`/constructionform?companyId=${company._id}`)
                  }
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-companies">
            <p>No construction companies found.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedCompany && (
        <div className="details-overlay active" onClick={closeDetails}>
          <div className="details-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-details" onClick={closeDetails}>
              <i className="fas fa-times"></i>
            </button>

            <h2 className="detail-company-name">
              {selectedCompany.companyName}
            </h2>
            <p className="detail-company-subtitle">
              {selectedCompany.contactPerson
                ? `${selectedCompany.contactPerson} - `
                : ""}
              Leading Engineering & Construction
            </p>

            <div className="detail-section">
              <h3 className="detail-section-title">Company Overview</h3>
              <div className="detail-stats">
                <div className="detail-stat">
                  <div className="detail-stat-number">
                    {selectedCompany.projectsCompleted || "0+"}
                  </div>
                  <div className="detail-stat-label">Projects Completed</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-number">
                    {selectedCompany.yearsInBusiness || "0"}
                  </div>
                  <div className="detail-stat-label">Years in Business</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-number">
                    {selectedCompany.size || "N/A"}
                  </div>
                  <div className="detail-stat-label">Employees</div>
                </div>
              </div>
              <p className="detail-description">
                {selectedCompany.aboutForCustomers ||
                  "Company description not available."}
              </p>
            </div>

            {selectedCompany.teamMembers &&
              selectedCompany.teamMembers.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Key Team Members</h3>
                  {selectedCompany.teamMembers.map((member, idx) => (
                    <div key={idx} className="detail-team-member">
                      <img
                        src={member.image || "/api/placeholder/120/120"}
                        alt={member.name}
                        className="member-image"
                      />
                      <div className="member-info">
                        <h4 className="member-name">{member.name}</h4>
                        <p className="member-position">{member.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {selectedCompany.completedProjects &&
              selectedCompany.completedProjects.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Completed Projects</h3>
                  <div className="detail-projects">
                    {selectedCompany.completedProjects.map((project, idx) => (
                      <div key={idx} className="project-item">
                        <img
                          src={project.image || "/api/placeholder/120/120"}
                          alt={project.title}
                          className="project-image"
                        />
                        <div className="project-info">
                          <h4 className="project-name">{project.title}</h4>
                          <p className="project-description">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {selectedCompany.didYouKnow && (
              <div className="detail-section">
                <h3 className="detail-section-title">Did You Know?</h3>
                <p className="detail-description">
                  {selectedCompany.didYouKnow}
                </p>
              </div>
            )}

            <button
              className="detail-book-now"
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
        className="back-to-top"
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
