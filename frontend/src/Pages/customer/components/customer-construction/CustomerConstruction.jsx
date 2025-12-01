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
  const [showAllReviews, setShowAllReviews] = useState(false);
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
    setShowAllReviews(false);
    document.body.style.overflow = "hidden";
  };

  const closeDetails = () => {
    setSelectedCompany(null);
    setShowAllReviews(false);
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

              {/* Display average rating if available */}
              {company.totalReviews > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  margin: "10px 0",
                  border: "1px solid #ffc107"
                }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ 
                        fontSize: "18px", 
                        color: star <= Math.round(company.averageRating || 0) ? "#ffc107" : "#ddd" 
                      }}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span style={{ fontWeight: "700", color: "#856404", fontSize: "16px" }}>
                    {company.averageRating}
                  </span>
                  <span style={{ color: "#856404", fontSize: "14px" }}>
                    ({company.totalReviews} {company.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

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

            {selectedCompany.completedProjects &&
              selectedCompany.completedProjects.length > 0 && (
                <div className="construction-detail-section">
                  <h3 className="construction-detail-section-title">
                    Completed Projects
                  </h3>
                  <div className="construction-detail-projects">
                    {selectedCompany.completedProjects.map((project, idx) => (
                      <div key={idx} className="construction-project-item">
                        <div className="construction-project-images">
                          {project.beforeImage && (
                            <div className="construction-project-image-container">
                              <img
                                src={project.beforeImage}
                                alt={`${project.title} - Before`}
                                className="construction-project-image"
                              />
                              <span className="construction-image-label">Before Construction</span>
                            </div>
                          )}
                          {project.afterImage && (
                            <div className="construction-project-image-container">
                              <img
                                src={project.afterImage}
                                alt={`${project.title} - After`}
                                className="construction-project-image"
                              />
                              <span className="construction-image-label">After Construction</span>
                            </div>
                          )}
                        </div>
                        <div className="construction-project-info">
                          <h4 className="construction-project-name">
                            {project.title}
                          </h4>
                          <p className="construction-project-description">
                            {project.description}
                          </p>
                          {project.location && (
                            <p className="construction-project-location">
                              <i className="fas fa-map-marker-alt"></i> {project.location}
                            </p>
                          )}
                          {project.tenderId && (
                            <p className="construction-project-tender">
                              <strong>Tender ID:</strong> {project.tenderId}
                            </p>
                          )}
                          {project.gpsLink && project.gpsLink.trim() !== "" && (
                            <p className="construction-project-link">
                              <a href={project.gpsLink} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-map"></i> View on Map
                              </a>
                            </p>
                          )}
                          {project.materialCertificate && project.materialCertificate.trim() !== "" && (project.materialCertificate.startsWith('http') || project.materialCertificate.startsWith('https')) ? (
                            <p className="construction-project-link">
                              <a href={project.materialCertificate} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-certificate"></i> Material Certificate
                              </a>
                            </p>
                          ) : project.materialCertificate && project.materialCertificate.trim() !== "" ? (
                            <p className="construction-project-certificate-pending">
                              <i className="fas fa-certificate"></i> Certificate uploaded (pending processing)
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Completed Projects on Our Website - Reviews Section */}
            {selectedCompany.completedProjectsWithReviews &&
              selectedCompany.completedProjectsWithReviews.length > 0 && (
                <div className="construction-detail-section" style={{
                  backgroundColor: "#f8f9fa",
                  padding: "25px",
                  borderRadius: "12px",
                  border: "2px solid #e0e0e0"
                }}>
                  <h3 className="construction-detail-section-title" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px"
                  }}>
                    <span>⭐ Completed Projects on Our Website</span>
                  </h3>
                  
                  {/* Average Rating Summary */}
                  <div style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    marginBottom: "25px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ fontSize: "48px", fontWeight: "700", color: "#333", marginBottom: "10px" }}>
                      {selectedCompany.averageRating || 0}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginBottom: "10px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ 
                          fontSize: "32px", 
                          color: star <= Math.round(selectedCompany.averageRating || 0) ? "#ffc107" : "#ddd" 
                        }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div style={{ color: "#666", fontSize: "16px" }}>
                      Based on {selectedCompany.totalReviews} {selectedCompany.totalReviews === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {selectedCompany.completedProjectsWithReviews
                      .slice(0, showAllReviews ? selectedCompany.completedProjectsWithReviews.length : 2)
                      .map((project, idx) => (
                      <div key={idx} style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        border: "1px solid #e0e0e0"
                      }}>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "flex-start",
                          marginBottom: "12px",
                          flexWrap: "wrap",
                          gap: "10px"
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            color: "#333",
                            fontSize: "18px",
                            fontWeight: "600"
                          }}>
                            {project.projectName}
                          </h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} style={{ 
                                fontSize: "20px", 
                                color: star <= (project.customerReview?.rating || 0) ? "#ffc107" : "#ddd" 
                              }}>
                                ★
                              </span>
                            ))}
                            <span style={{ 
                              marginLeft: "8px", 
                              fontWeight: "700", 
                              color: "#ffc107",
                              fontSize: "18px"
                            }}>
                              {project.customerReview?.rating || 0}/5
                            </span>
                          </div>
                        </div>
                        
                        {/* Completion Images Gallery */}
                        {project.completionImages && project.completionImages.length > 0 && (
                          <div style={{ marginTop: "15px" }}>
                            <h5 style={{ 
                              fontSize: "14px", 
                              color: "#333", 
                              marginBottom: "10px",
                              fontWeight: "600" 
                            }}>
                              📸 Project Completion Photos
                            </h5>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                              gap: "10px"
                            }}>
                              {project.completionImages.map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={`http://localhost:3000/${img}`}
                                  alt={`Completion ${imgIdx + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    border: "2px solid #e0e0e0",
                                    transition: "transform 0.2s"
                                  }}
                                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                                  onClick={() => window.open(`http://localhost:3000/${img}`, '_blank')}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {project.customerReview?.reviewText && (
                          <p style={{ 
                            margin: "12px 0 0 0", 
                            color: "#555", 
                            lineHeight: "1.6",
                            fontStyle: "italic",
                            padding: "12px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                            borderLeft: "4px solid #ffc107"
                          }}>
                            "{project.customerReview.reviewText}"
                          </p>
                        )}
                        
                        {project.customerReview?.reviewDate && (
                          <div style={{ 
                            marginTop: "12px", 
                            color: "#999", 
                            fontSize: "13px",
                            textAlign: "right"
                          }}>
                            {new Date(project.customerReview.reviewDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* View More Button */}
                  {selectedCompany.completedProjectsWithReviews.length > 2 && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        style={{
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          padding: "12px 30px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "16px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          transition: "background-color 0.3s"
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
                      >
                        {showAllReviews ? "Show Less" : "View All"}
                      </button>
                    </div>
                  )}
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
