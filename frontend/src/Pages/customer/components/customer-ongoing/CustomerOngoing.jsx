<<<<<<< Updated upstream
=======
// src/Pages/customer/components/customer-ongoing/CustomerOngoing.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerOngoing.css";

const CustomerOngoing = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState({ show: false, projectId: null, milestone: null });
  const [feedbackText, setFeedbackText] = useState("");

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
    try {
      const res = await axios.post(
        "/api/projects/customer/approve-milestone",
        { projectId, milestonePercentage },
        { withCredentials: true }
      );
      if (res.data.success) {
        // Refresh projects
        const updatedProjects = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(updatedProjects.data.projects || []);
        alert("Milestone approved successfully!");
      }
    } catch (err) {
      console.error("Failed to approve milestone:", err);
      alert(err.response?.data?.error || "Failed to approve milestone");
    }
  };

  const openFeedbackModal = (projectId, milestone) => {
    setFeedbackModal({ show: true, projectId, milestone });
    setFeedbackText("");
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ show: false, projectId: null, milestone: null });
    setFeedbackText("");
  };

  const handleRequestRevision = async () => {
    if (!feedbackText.trim()) {
      alert("Please provide feedback for the company");
      return;
    }
    try {
      const res = await axios.post(
        "/api/projects/customer/request-milestone-revision",
        {
          projectId: feedbackModal.projectId,
          milestonePercentage: feedbackModal.milestone,
          feedback: feedbackText,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        // Refresh projects
        const updatedProjects = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(updatedProjects.data.projects || []);
        closeFeedbackModal();
        alert("Revision request sent to company!");
      }
    } catch (err) {
      console.error("Failed to request revision:", err);
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

                      {/* Milestone Checkpoints */}
                      {project.milestones && project.milestones.filter(m => m.isCheckpoint).length > 0 && (
                        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                          <h3 style={{ marginTop: 0, marginBottom: "15px", fontSize: "1.1em" }}>Milestone Checkpoints</h3>
                          {project.milestones
                            .filter(m => m.isCheckpoint)
                            .sort((a, b) => b.percentage - a.percentage)
                            .map((milestone, idx) => (
                              <div key={idx} style={{
                                backgroundColor: milestone.isApprovedByCustomer ? "#d4edda" : milestone.needsRevision ? "#ffe6e6" : "#fff3cd",
                                border: `2px solid ${milestone.isApprovedByCustomer ? "#28a745" : milestone.needsRevision ? "#dc3545" : "#ffc107"}`,
                                borderRadius: "8px",
                                padding: "15px",
                                marginBottom: "15px"
                              }}>
                                <div style={{ marginBottom: "10px" }}>
                                  <h4 style={{ margin: 0, color: "#333" }}>
                                    {milestone.percentage}% Milestone
                                    {milestone.isApprovedByCustomer ? (
                                      <span style={{ marginLeft: "10px", color: "#28a745", fontSize: "0.9em" }}>
                                        ✓ Approved
                                      </span>
                                    ) : milestone.needsRevision ? (
                                      <span style={{ marginLeft: "10px", color: "#dc3545", fontSize: "0.9em" }}>
                                        ⚠ Revision Requested
                                      </span>
                                    ) : (
                                      <span style={{ marginLeft: "10px", color: "#856404", fontSize: "0.9em" }}>
                                        ⏳ Awaiting Your Approval
                                      </span>
                                    )}
                                  </h4>
                                  {milestone.submittedAt && (
                                    <small style={{ color: "#666" }}>
                                      Submitted: {new Date(milestone.submittedAt).toLocaleDateString()}
                                    </small>
                                  )}
                                </div>
                                <div style={{
                                  backgroundColor: "white",
                                  padding: "12px",
                                  borderRadius: "6px"
                                }}>
                                  <strong style={{ display: "block", marginBottom: "8px", color: "#555" }}>Company Message:</strong>
                                  <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.companyMessage}</p>
                                </div>
                                {!milestone.isApprovedByCustomer && !milestone.needsRevision && (
                                  <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                                    <button
                                      onClick={() => handleApproveMilestone(project._id, milestone.percentage)}
                                      style={{
                                        flex: 1,
                                        padding: "10px 20px",
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      ✓ Approve Milestone
                                    </button>
                                    <button
                                      onClick={() => openFeedbackModal(project._id, milestone.percentage)}
                                      style={{
                                        flex: 1,
                                        padding: "10px 20px",
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      ✗ Request Revision
                                    </button>
                                  </div>
                                )}
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
                                    <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
                                      Waiting for company to update their message
                                    </small>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}

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

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0, color: "#333" }}>Request Revision for {feedbackModal.milestone}% Milestone</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Please provide specific feedback about what needs to be improved or clarified:
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Example: Please provide more details about the foundation work completed, including photos of the reinforcement..."
              rows="6"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "1em",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleRequestRevision}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1em"
                }}
              >
                Send Revision Request
              </button>
              <button
                onClick={closeFeedbackModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1em"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerOngoing;
>>>>>>> Stashed changes
