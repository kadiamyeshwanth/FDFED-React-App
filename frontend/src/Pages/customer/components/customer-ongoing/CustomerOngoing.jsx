// src/Pages/customer/components/customer-ongoing/CustomerOngoing.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerOngoing.css";

const CustomerOngoing = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [revisionFeedback, setRevisionFeedback] = useState({});
  const [showRevisionModal, setShowRevisionModal] = useState(null);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error("Failed to load ongoing projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleDetails = (id) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApproveMilestone = async (projectId, milestonePercentage) => {
    if (!window.confirm(`Are you satisfied with the ${milestonePercentage}% milestone progress?`)) {
      return;
    }

    try {
      const res = await axios.post(
        "/api/customer/approve-milestone",
        { projectId, milestonePercentage },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert(res.data.message);
        // Refresh projects
        const projectsRes = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(projectsRes.data.projects || []);
      }
    } catch (err) {
      console.error("Error approving milestone:", err);
      alert(err.response?.data?.error || "Failed to approve milestone");
    }
  };

  const handleRequestRevision = async (projectId, milestonePercentage) => {
    const feedback = revisionFeedback[`${projectId}_${milestonePercentage}`];
    
    if (!feedback || feedback.trim() === "") {
      alert("Please provide feedback for the revision request");
      return;
    }

    try {
      const res = await axios.post(
        "/api/customer/request-milestone-revision",
        { projectId, milestonePercentage, feedback },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert(res.data.message);
        setShowRevisionModal(null);
        setRevisionFeedback({});
        // Refresh projects
        const projectsRes = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(projectsRes.data.projects || []);
      }
    } catch (err) {
      console.error("Error requesting revision:", err);
      alert(err.response?.data?.error || "Failed to request revision");
    }
  };

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.buildingType === filter);

  if (loading) {
    return (
      <>
        <div className="co-container">
          <div className="co-no-projects">
            <p>Loading ongoing projects...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="co-container">
        <div className="co-header">
          <h1>Ongoing Projects</h1>
        </div>

        <div className="co-content-wrapper">
          {/* LEFT SECTION */}
          <div className="co-left-section">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <React.Fragment key={project._id}>
                  {/* PROJECT CARD */}
                  <div className="co-project-display">
                    <div className="co-project-image">
                      <img
                        src={
                          project.mainImagePath ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqjSRsiV4Q22mOElSnkcct2oZmd-1iVrNOcQ&s"
                        }
                        alt={`${project.projectName} Image`}
                      />
                    </div>

                    <div className="co-project-details">
                      <h2>{project.projectName}</h2>

                      <div className="co-location">
                        <span>
                          <svg
                            className="co-location-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {project.projectAddress}
                        </span>
                      </div>

                      <div className="co-tags-container">
                        <span className="co-project-tag">
                          {project.buildingType
                            ? project.buildingType.charAt(0).toUpperCase() +
                              project.buildingType.slice(1)
                            : "Other"}
                        </span>
                      </div>

                      <div className="co-progress-container">
                        <div className="co-progress-bar">
                          <div
                            className="co-progress-fill"
                            style={{
                              width: `${project.completionPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="co-progress-text">
                          <span>
                            Project Completion:{" "}
                            <span className="co-progress-percentage">
                              {project.completionPercentage || 0}%
                            </span>
                          </span>
                          <span>
                            Target: {project.targetCompletionDate || "N/A"}
                          </span>
                        </div>
                      </div>

                      <p>
                        Current phase: {project.currentPhase || "Not specified"}
                      </p>

                      <div className="co-action-buttons">
                        <button
                          className="co-view-details-btn"
                          onClick={() => toggleDetails(project._id)}
                        >
                          {expandedDetails[project._id]
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                    {/* EXPANDABLE DETAILS */}
                  <div
                    className={`co-view-details ${
                      expandedDetails[project._id] ? "active" : ""
                    }`}
                    id={`details-${project._id}`}
                  >
                    {/* Milestone Progress Section */}
                    {project.milestones && project.milestones.length > 0 && (
                      <>
                        <h3>Project Milestones & Progress Reports</h3>
                        <div className="co-milestones-list" style={{ marginBottom: "20px" }}>
                          {project.milestones
                            .sort((a, b) => a.percentage - b.percentage)
                            .filter((m) => m.isCheckpoint)
                            .map((milestone, idx) => (
                              <div key={idx} className="co-milestone-item" style={{
                                backgroundColor: milestone.isApprovedByCustomer ? "#d4edda" : milestone.needsRevision ? "#ffe6e6" : "#fff3cd",
                                border: `2px solid ${milestone.isApprovedByCustomer ? "#28a745" : milestone.needsRevision ? "#dc3545" : "#ffc107"}`,
                                borderRadius: "8px",
                                padding: "15px",
                                marginBottom: "15px"
                              }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                  <div>
                                    <h4 style={{ margin: 0, color: "#333" }}>
                                      {milestone.percentage}% Milestone
                                      {milestone.isApprovedByCustomer ? (
                                        <span style={{ marginLeft: "10px", color: "#28a745", fontSize: "0.9em" }}>
                                          ✓ Approved by You
                                        </span>
                                      ) : milestone.needsRevision ? (
                                        <span style={{ marginLeft: "10px", color: "#dc3545", fontSize: "0.9em" }}>
                                          ⚠ Revision Requested - Awaiting Company Update
                                        </span>
                                      ) : (
                                        <span style={{ marginLeft: "10px", color: "#856404", fontSize: "0.9em" }}>
                                          ⏳ Awaiting Your Approval
                                        </span>
                                      )}
                                    </h4>
                                    <div style={{ fontSize: "0.85em", color: "#666", marginTop: "5px" }}>
                                      Submitted: {new Date(milestone.submittedAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                      {milestone.approvedAt && (
                                        <span style={{ marginLeft: "15px" }}>
                                          Approved: {new Date(milestone.approvedAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                          })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div style={{
                                  backgroundColor: "white",
                                  padding: "12px",
                                  borderRadius: "6px",
                                  marginTop: "10px"
                                }}>
                                  <strong style={{ display: "block", marginBottom: "8px", color: "#555" }}>Company Progress Report:</strong>
                                  <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.companyMessage}</p>
                                </div>
                                {milestone.needsRevision && milestone.customerFeedback && (
                                  <div style={{
                                    backgroundColor: "#fff3cd",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginTop: "10px",
                                    border: "1px solid #ffc107"
                                  }}>
                                    <strong style={{ display: "block", marginBottom: "8px", color: "#856404" }}>Your Feedback:</strong>
                                    <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.customerFeedback}</p>
                                  </div>
                                )}
                                {!milestone.isApprovedByCustomer && !milestone.needsRevision && (
                                  <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
                                      onClick={() => handleApproveMilestone(project._id, milestone.percentage)}
                                    >
                                      ✓ Approve & Proceed
                                    </button>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ backgroundColor: "#ffc107", color: "#333", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
                                      onClick={() => setShowRevisionModal(`${project._id}_${milestone.percentage}`)}
                                    >
                                      ⚠ Request Revision
                                    </button>
                                  </div>
                                )}
                                {showRevisionModal === `${project._id}_${milestone.percentage}` && (
                                  <div style={{
                                    marginTop: "15px",
                                    padding: "15px",
                                    backgroundColor: "white",
                                    borderRadius: "6px",
                                    border: "2px solid #ffc107"
                                  }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                                      Provide feedback for revision:
                                    </label>
                                    <textarea
                                      style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                        minHeight: "80px",
                                        resize: "vertical"
                                      }}
                                      placeholder="Please specify what needs to be revised or improved..."
                                      value={revisionFeedback[`${project._id}_${milestone.percentage}`] || ""}
                                      onChange={(e) => setRevisionFeedback(prev => ({
                                        ...prev,
                                        [`${project._id}_${milestone.percentage}`]: e.target.value
                                      }))}
                                    />
                                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                                      <button
                                        className="co-view-details-btn"
                                        style={{ backgroundColor: "#ffc107", color: "#333", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
                                        onClick={() => handleRequestRevision(project._id, milestone.percentage)}
                                      >
                                        Submit Revision Request
                                      </button>
                                      <button
                                        className="co-view-details-btn"
                                        style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
                                        onClick={() => {
                                          setShowRevisionModal(null);
                                          setRevisionFeedback(prev => {
                                            const newState = { ...prev };
                                            delete newState[`${project._id}_${milestone.percentage}`];
                                            return newState;
                                          });
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </>
                    )}

                    {/* All Images */}
                    <h3>All Images</h3>
                    <div className="co-images">
                      {project.additionalImagePaths &&
                      project.additionalImagePaths.length > 0 ? (
                        project.additionalImagePaths.map((img, i) => (
                          <img key={i} src={img} alt={`Additional ${i + 1}`} />
                        ))
                      ) : (
                        <p>No images uploaded yet</p>
                      )}
                    </div>

                    {/* Recent Updates */}
                    <h3>Recent Updates</h3>
                    <div className="co-recent-updates">
                      {project.updates && project.updates.length > 0 ? (
                        project.updates.map((update, i) => (
                          <div key={i} className="co-update">
                            <img
                              src={update.image || "/images/update-default.jpg"}
                              alt="Update"
                            />
                            <p>{update.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="co-update">
                          <img
                            src="/images/update-default-1.jpg"
                            alt="Default"
                          />
                          <p>No updates yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Project Submission Details */}
                    <div className="co-project-submission-details">
                      <h3>Project Submission Details</h3>

                      <div className="co-section">
                        <h4>Customer Information</h4>
                        <p>
                          <strong>Full Name:</strong> {project.customerName}
                        </p>
                        <p>
                          <strong>Email Address:</strong>{" "}
                          {project.customerEmail}
                        </p>
                        <p>
                          <strong>Phone Number:</strong> {project.customerPhone}
                        </p>
                      </div>

                      <div className="co-section">
                        <h4>Project Details</h4>
                        <p>
                          <strong>Project Address:</strong>{" "}
                          {project.projectAddress}
                        </p>
                        <p>
                          <strong>Project Location:</strong>{" "}
                          {project.projectLocation}
                        </p>
                        <p>
                          <strong>Total Building Area:</strong>{" "}
                          {project.totalArea} sq meters
                        </p>
                        <p>
                          <strong>Building Type:</strong>{" "}
                          {project.buildingType
                            ? project.buildingType.charAt(0).toUpperCase() +
                              project.buildingType.slice(1)
                            : "Other"}
                        </p>
                        <p>
                          <strong>Estimated Budget:</strong>{" "}
                          {project.estimatedBudget
                            ? `$${project.estimatedBudget.toLocaleString()}`
                            : "None specified"}
                        </p>
                        <p>
                          <strong>Expected Timeline:</strong>{" "}
                          {project.projectTimeline
                            ? `${project.projectTimeline} months`
                            : "None specified"}
                        </p>
                      </div>

                      <div className="co-section">
                        <h4>Floor Plans</h4>
                        <p>
                          <strong>Total Floors:</strong> {project.totalFloors}
                        </p>
                        {project.floors && project.floors.length > 0 ? (
                          project.floors.map((floor, i) => (
                            <div key={i} className="co-floor-plan">
                              <p>
                                <strong>
                                  Floor {floor.floorNumber || i + 1}
                                </strong>
                              </p>
                              <p>
                                <strong>Floor Type:</strong>{" "}
                                {floor.floorType
                                  ? floor.floorType.charAt(0).toUpperCase() +
                                    floor.floorType.slice(1)
                                  : "Other"}
                              </p>
                              <p>
                                <strong>Floor Area:</strong>{" "}
                                {floor.floorArea || "None specified"} sq meters
                              </p>
                              <p>
                                <strong>Floor Description:</strong>{" "}
                                {floor.floorDescription || "None specified"}
                              </p>
                              {floor.floorImagePath ? (
                                <img
                                  src={floor.floorImagePath}
                                  alt={`Floor ${
                                    floor.floorNumber || i + 1
                                  } Plan`}
                                />
                              ) : (
                                <img
                                  src="/images/floor-default.jpg"
                                  alt="Default Floor Plan"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="co-floor-plan">
                            <p>
                              <strong>Floor plans not yet available</strong>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="co-section">
                        <h4>Additional Requirements</h4>
                        <p>
                          <strong>Special Requirements:</strong>{" "}
                          {project.specialRequirements || "None specified"}
                        </p>
                        <p>
                          <strong>Accessibility Needs:</strong>{" "}
                          {project.accessibilityNeeds
                            ? project.accessibilityNeeds
                                .charAt(0)
                                .toUpperCase() +
                              project.accessibilityNeeds.slice(1)
                            : "None specified"}
                        </p>
                        <p>
                          <strong>Energy Efficiency Goals:</strong>{" "}
                          {project.energyEfficiency
                            ? project.energyEfficiency.charAt(0).toUpperCase() +
                              project.energyEfficiency.slice(1)
                            : "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="co-no-projects">
                <p>
                  No ongoing projects found. All accepted projects will appear
                  here.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SECTION - FILTERS */}
          <div className="co-rgt-section">
            <div className="co-filter-properties">
              <h2>Filter Properties</h2>
              <button
                className={`co-filter-button ${
                  filter === "all" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("all")}
              >
                All Properties
              </button>
              <button
                className={`co-filter-button ${
                  filter === "residential" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("residential")}
              >
                Residential
              </button>
              <button
                className={`co-filter-button ${
                  filter === "commercial" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("commercial")}
              >
                Commercial
              </button>
              <button
                className={`co-filter-button ${
                  filter === "industrial" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("industrial")}
              >
                Industrial
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerOngoing;
