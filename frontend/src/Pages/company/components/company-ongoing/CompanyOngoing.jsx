// src/pages/company/CompanyOngoing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompanyOngoing.css";

const CompanyOngoing = () => {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedUpdates, setExpandedUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  /* -------------------------------------------------
   *  Load data
   * -------------------------------------------------*/
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/companyongoing_projects", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch ongoing projects");
        const data = await res.json();
        setProjects(data.projects || []);
        setMetrics(data.metrics || null);
      } catch (err) {
        console.error(err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* -------------------------------------------------
   *  Filter
   * -------------------------------------------------*/
  const handleFilter = (type) => {
    setFilter(type);
    setExpandedDetails({});
    setExpandedUpdates({});
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    return p.buildingType?.toLowerCase() === filter;
  });

  /* -------------------------------------------------
   *  Toggle Details / Updates (mutual exclusion)
   * -------------------------------------------------*/
  const toggleDetails = (id) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
    setExpandedUpdates((prev) => ({ ...prev, [id]: false }));
  };

  const toggleUpdates = (id) => {
    setExpandedUpdates((prev) => ({ ...prev, [id]: !prev[id] }));
    setExpandedDetails((prev) => ({ ...prev, [id]: false }));
  };

  /* -------------------------------------------------
   *  Format date
   * -------------------------------------------------*/
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* -------------------------------------------------
   *  Loading / Error
   * -------------------------------------------------*/
  if (loading) {
    return (
      <div className="ongoing-container">
        <div className="ongoing-loading">Loading ongoing projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ongoing-container">
        <div className="ongoing-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="ongoing-container">
      {/* ------------------ METRICS ------------------ */}
      {metrics && (
        <div className="ongoing-dashboard-metrics">
          <div className="ongoing-metric-card">
            <div className="ongoing-metric-title">Total Active Projects</div>
            <div className="ongoing-metric-value">{metrics.totalActiveProjects}</div>
          </div>
          <div className="ongoing-metric-card">
            <div className="ongoing-metric-title">Monthly Revenue</div>
            <div className="ongoing-metric-value">₹{metrics.monthlyRevenue} Cr</div>
          </div>
          <div className="ongoing-metric-card">
            <div className="ongoing-metric-title">Customer Satisfaction</div>
            <div className="ongoing-metric-value">{metrics.customerSatisfaction}/5</div>
          </div>
          <div className="ongoing-metric-card">
            <div className="ongoing-metric-title">Projects On Schedule</div>
            <div className="ongoing-metric-value">{metrics.projectsOnSchedule}%</div>
          </div>
        </div>
      )}

      {/* ------------------ MAIN CONTENT ------------------ */}
      <div className="ongoing-content-wrapper">
        <div className="ongoing-left-section">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <React.Fragment key={project._id}>
                {/* ----- PROJECT CARD ----- */}
                <div className="ongoing-project-display">
                  {/* IMAGE */}
                  <div className="ongoing-project-image">
                    <img
                      src={project.mainImagePath || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANdGcSqjSRsiV4Q22mOElSnkcct2oZmd-1iVrNOcQ&s"}
                      alt={project.projectName}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="ongoing-project-details">
                    <h2>{project.projectName}</h2>

                    <div className="ongoing-location">
                      <svg className="ongoing-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {project.projectAddress}
                    </div>

                    <div className="ongoing-tags-container">
                      <span className="ongoing-project-tag">
                        {project.buildingType ? project.buildingType.charAt(0).toUpperCase() + project.buildingType.slice(1) : "Other"}
                      </span>
                      <span className="ongoing-status-tag">Under Construction</span>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="ongoing-progress-container">
                      <div className="ongoing-progress-bar">
                        <div
                          className="ongoing-progress-fill"
                          style={{ width: `${project.completionPercentage || 0}%` }}
                        ></div>
                      </div>
                      <div className="ongoing-progress-text">
                        <span>
                          Project Completion: <span className="ongoing-progress-percentage">{project.completionPercentage || 0}%</span>
                        </span>
                        {project.targetCompletionDate && (
                          <span>Target: {formatDate(project.targetCompletionDate)}</span>
                        )}
                      </div>
                    </div>

                    <p>
                      Current phase: <span>{project.currentPhase}</span>
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="ongoing-action-buttons">
                      <button
                        className="ongoing-view-details-btn"
                        onClick={() => toggleDetails(project._id)}
                      >
                        {expandedDetails[project._id] ? "Hide Details" : "View Details"}
                      </button>
                      <button
                        className="ongoing-project-updates-btn"
                        onClick={() => toggleUpdates(project._id)}
                      >
                        {expandedUpdates[project._id] ? "Hide Updates" : "Progress & Updates"}
                      </button>
                      <button
                        className="ongoing-edit-btn"
                        onClick={() => navigate(`../addnewproject?projectId=${project._id}`)}
                      >
                        Edit Project
                      </button>
                    </div>
                  </div>
                </div>

                {/* ----- EXPANDED DETAILS ----- */}
                <div
                  className={`ongoing-view-details ${expandedDetails[project._id] ? "ongoing-active" : ""}`}
                >
                  <h3>Project Submission Details</h3>

                  <div className="ongoing-section">
                    <h4>Customer Information</h4>
                    <div className="ongoing-details-grid">
                      <p><strong>Full Name:</strong> {project.customerName}</p>
                      <p><strong>Email Address:</strong> {project.customerEmail}</p>
                      <p><strong>Phone Number:</strong> {project.customerPhone}</p>
                    </div>
                  </div>

                  <div className="ongoing-section">
                    <h4>Project Details</h4>
                    <div className="ongoing-details-grid">
                      <p><strong>Project Address:</strong> {project.projectAddress}</p>
                      <p><strong>Project Location:</strong> {project.projectLocation}</p>
                      <p><strong>Total Building Area:</strong> {project.totalArea} sq meters</p>
                      <p>
                        <strong>Building Type:</strong>{" "}
                        {project.buildingType ? project.buildingType.charAt(0).toUpperCase() + project.buildingType.slice(1) : "Other"}
                      </p>
                      <p>
                        <strong>Estimated Budget:</strong>{" "}
                        {project.estimatedBudget ? `$${project.estimatedBudget.toLocaleString()}` : "None specified"}
                      </p>
                      <p>
                        <strong>Expected Timeline:</strong>{" "}
                        {project.projectTimeline ? `${project.projectTimeline} months` : "None specified"}
                      </p>
                    </div>
                  </div>

                  <div className="ongoing-section">
                    <h4>Floor Plans</h4>
                    <p><strong>Total Floors:</strong> {project.totalFloors}</p>
                    {project.floors && project.floors.length > 0 ? (
                      project.floors.map((floor, idx) => (
                        <div key={idx} className="ongoing-floor-plan">
                          <p><strong>Floor {floor.floorNumber || "Unknown"}</strong></p>
                          <p>
                            <strong>Floor Type:</strong>{" "}
                            {floor.floorType ? floor.floorType.charAt(0).toUpperCase() + floor.floorType.slice(1) : "Other"}
                          </p>
                          <p><strong>Floor Area:</strong> {floor.floorArea || "None specified"} sq meters</p>
                          <p><strong>Floor Description:</strong> {floor.floorDescription || "None specified"}</p>
                          {floor.floorImage ? (
                            <img src={floor.floorImage} alt={`Floor ${floor.floorNumber} Plan`} />
                          ) : (
                            <img src="/images/floor-default.jpg" alt="Default Floor Plan" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="ongoing-floor-plan">
                        <p><strong>Floor plans not yet available</strong></p>
                      </div>
                    )}
                  </div>

                  <div className="ongoing-section">
                    <h4>Additional Requirements</h4>
                    <div className="ongoing-details-grid">
                      <p><strong>Special Requirements:</strong> {project.specialRequirements || "None specified"}</p>
                      <p>
                        <strong>Accessibility Needs:</strong>{" "}
                        {project.accessibilityNeeds ? project.accessibilityNeeds.charAt(0).toUpperCase() + project.accessibilityNeeds.slice(1) : "None specified"}
                      </p>
                      <p>
                        <strong>Energy Efficiency Goals:</strong>{" "}
                        {project.energyEfficiency ? project.energyEfficiency.charAt(0).toUpperCase() + project.energyEfficiency.slice(1) : "Standard"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ----- EXPANDED UPDATES ----- */}
                <div
                  className={`ongoing-project-updates ${expandedUpdates[project._id] ? "ongoing-active" : ""}`}
                >
                  <h3>Project Progress & Updates</h3>
                  <h4 className="ongoing-updates-subtitle">Recent Activity</h4>
                  {project.recentUpdates && project.recentUpdates.length > 0 ? (
                    project.recentUpdates.map((update, idx) => (
                      <div key={idx} className="ongoing-update-item">
                        <div className="ongoing-Updates-left-section">
                          {update.updateImagePath && (
                            <img src={update.updateImagePath} alt="Update" />
                          )}
                          <div className="ongoing-update-meta-date">
                            {new Date(update.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                        <div>
                          <h4>Description:</h4>
                          <p>{update.updateText}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="ongoing-no-updates">
                      <p>No recent updates for this project.</p>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="ongoing-no-projects">
              <p>No ongoing projects found. All accepted projects will appear here.</p>
            </div>
          )}
        </div>

        {/* ------------------ FILTER SIDEBAR ------------------ */}
        <div className="ongoing-right-section">
          <div className="ongoing-filter-properties">
            <h2>Filter Properties</h2>
            <button
              className={`ongoing-filter-button ${filter === "all" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("all")}
            >
              All Properties
            </button>
            <button
              className={`ongoing-filter-button ${filter === "residential" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("residential")}
            >
              Residential
            </button>
            <button
              className={`ongoing-filter-button ${filter === "commercial" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("commercial")}
            >
              Commercial
            </button>
            <button
              className={`ongoing-filter-button ${filter === "industrial" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("industrial")}
            >
              Industrial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOngoing;