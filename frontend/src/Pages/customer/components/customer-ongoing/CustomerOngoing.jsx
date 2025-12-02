// src/Pages/customer/components/customer-ongoing/CustomerOngoing.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerOngoing.css";
import Modal from 'react-modal';

const CustomerOngoing = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [expandedUpdates, setExpandedUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [revisionFeedback, setRevisionFeedback] = useState({});
  const [showRevisionModal, setShowRevisionModal] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState({});
  const [reviewText, setReviewText] = useState({});
  const [hoveredRating, setHoveredRating] = useState({});
  const [showComplaintModal, setShowComplaintModal] = useState(null); // key: `${projectId}_${milestone}`
  const [complaintText, setComplaintText] = useState({});
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [complaintError, setComplaintError] = useState(null);
  const [unviewedMessages, setUnviewedMessages] = useState({}); // { projectId: count }

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(res.data.projects || []);
        
        // Fetch unviewed company messages
        try {
          const messagesRes = await axios.get('/api/customer/unviewed-company-messages', {
            withCredentials: true
          });
          if (messagesRes.data.success) {
            const messagesMap = {};
            messagesRes.data.unviewedByProject.forEach(item => {
              messagesMap[item._id] = item.count;
            });
            setUnviewedMessages(messagesMap);
          }
        } catch (messagesErr) {
          console.error('Error fetching unviewed messages:', messagesErr);
        }
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
    setExpandedMilestones((prev) => ({ ...prev, [id]: false }));
    setExpandedUpdates((prev) => ({ ...prev, [id]: false }));
  };

  const toggleMilestones = async (id) => {
    const wasExpanded = expandedMilestones[id];
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setExpandedDetails((prev) => ({ ...prev, [id]: false }));
    setExpandedUpdates((prev) => ({ ...prev, [id]: false }));
    
    // Mark company messages as viewed when opening milestones
    if (!wasExpanded && unviewedMessages[id]) {
      // Clear notification immediately
      setUnviewedMessages(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      
      try {
        await axios.post(`/api/customer/mark-messages-viewed/${id}`, {}, {
          withCredentials: true
        });
      } catch (err) {
        console.error('Error marking messages as viewed:', err);
        // Restore notification if failed
        setUnviewedMessages(prev => ({
          ...prev,
          [id]: 1
        }));
      }
    }
  };

  const toggleUpdates = (id) => {
    setExpandedUpdates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setExpandedDetails((prev) => ({ ...prev, [id]: false }));
    setExpandedMilestones((prev) => ({ ...prev, [id]: false }));
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

  const handleSubmitReview = async (projectId) => {
    const rating = reviewRating[projectId];
    const text = reviewText[projectId] || '';
    
    if (!rating) {
      alert("Please provide a rating");
      return;
    }

    try {
      const res = await axios.post(
        "/api/customer/submit-project-review",
        { projectId, rating, reviewText: text },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert(res.data.message);
        setShowReviewModal(null);
        setReviewRating({});
        setReviewText({});
        // Refresh projects
        const projectsRes = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(projectsRes.data.projects || []);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert(err.response?.data?.error || "Failed to submit review");
    }
  };

  const handleOpenComplaint = (projectId, milestone) => {
    setShowComplaintModal(`${projectId}_${milestone}`);
    setComplaintText({});
    setComplaintSuccess(false);
    setComplaintError(null);
  };
  const handleCloseComplaint = () => {
    setShowComplaintModal(null);
    setComplaintText({});
    setComplaintSuccess(false);
    setComplaintError(null);
  };
  const handleSubmitComplaint = async (projectId, milestone) => {
    setComplaintLoading(true);
    setComplaintError(null);
    try {
      await axios.post('/api/complaints', {
        projectId,
        milestone,
        senderType: 'customer',
        senderId: projectId, // Replace with actual customerId if available in context
        message: complaintText[`${projectId}_${milestone}`]
      }, { withCredentials: true });
      setComplaintSuccess(true);
      setComplaintText({});
    } catch (err) {
      setComplaintError('Failed to submit complaint');
    }
    setComplaintLoading(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    if (filter === "finished") return p.completionPercentage === 100;
    if (filter === "pending") return p.completionPercentage < 100;
    return true;
  });

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
                  <div className="co-project-display" style={{
                    border: "2px solid #e0e0e0",
                    borderRadius: "12px",
                    marginBottom: "25px",
                    padding: "15px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}>
                    <div className="co-project-image">
                      <img
                        src={
                          project.mainImagePath ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqjSRsiV4Q22mOElSnkcct2oZmd-1iVrNOcQ&s"
                        }
                        alt={`${project.projectName} Image`}
                        style={{
                          borderRadius: "8px",
                          objectFit: "cover"
                        }}
                      />
                    </div>

                    <div className="co-project-details">
                      {/* New Notification Box */}
                      {unviewedMessages[project._id] && (
                        <div style={{
                          backgroundColor: '#fff3cd',
                          border: '2px solid #ffc107',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          color: '#856404',
                          fontWeight: '500'
                        }}>
                          <span style={{ fontSize: '20px' }}>🔔</span>
                          <span>New notification from company - Check milestone updates</span>
                        </div>
                      )}
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

                      <div className="co-action-buttons" style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "15px"
                      }}>
                        <button
                          className="co-view-details-btn"
                          onClick={() => toggleUpdates(project._id)}
                          style={{
                            flex: "1",
                            minWidth: "140px",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "2px solid #6c757d",
                            backgroundColor: expandedUpdates[project._id] ? "#6c757d" : "#fff",
                            color: expandedUpdates[project._id] ? "#fff" : "#6c757d",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.3s"
                          }}
                        >
                          {expandedUpdates[project._id]
                            ? "Hide Recent Updates"
                            : "Recent Updates"}
                        </button>
                        <button
                          className="co-view-details-btn"
                          onClick={() => toggleMilestones(project._id)}
                          style={{
                            flex: "1",
                            minWidth: "140px",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "2px solid #6c757d",
                            backgroundColor: expandedMilestones[project._id] ? "#6c757d" : "#fff",
                            color: expandedMilestones[project._id] ? "#fff" : "#6c757d",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.3s"
                          }}
                        >
                          {expandedMilestones[project._id]
                            ? "Hide Milestones"
                            : "Milestones"}
                        </button>
                        <button
                          className="co-view-details-btn"
                          onClick={() => toggleDetails(project._id)}
                          style={{
                            flex: "1",
                            minWidth: "140px",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            border: "2px solid #6c757d",
                            backgroundColor: expandedDetails[project._id] ? "#6c757d" : "#fff",
                            color: expandedDetails[project._id] ? "#fff" : "#6c757d",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.3s"
                          }}
                        >
                          {expandedDetails[project._id]
                            ? "Hide Project Details"
                            : "Project Details"}
                        </button>
                      </div>

                      {/* Review Section for Completed & Approved Projects */}
                      {project.completionPercentage === 100 && project.milestones?.find(m => m.percentage === 100 && m.isApprovedByCustomer) && (
                        <div style={{
                          marginTop: "20px",
                          padding: "15px",
                          backgroundColor: "#f0f8ff",
                          borderRadius: "8px",
                          border: "2px solid #4CAF50"
                        }}>
                          {/* Completion Images Gallery */}
                          {project.completionImages && project.completionImages.length > 0 && (
                            <div>
                              <h4 style={{ color: "#2e7d32", fontSize: "16px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                📸 Final Project Completion Photos
                              </h4>
                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                                gap: "10px"
                              }}>
                                {project.completionImages.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Completion ${idx + 1}`}
                                    style={{
                                      width: "100%",
                                      height: "150px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      border: "2px solid #ddd",
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

                          {/* Customer Review Display (if already submitted) */}
                          {project.customerReview?.rating ? (
                            <div style={{ marginTop: project.completionImages?.length > 0 ? "20px" : "0" }}>
                              <h4 style={{ color: "#155724", fontSize: "16px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                                ✓ Your Review
                              </h4>
                              <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "8px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} style={{ fontSize: "20px", color: star <= project.customerReview.rating ? "#ffc107" : "#ddd" }}>
                                    ★
                                  </span>
                                ))}
                                <span style={{ marginLeft: "8px", fontWeight: "600", color: "#155724", fontSize: "16px" }}>
                                  {project.customerReview.rating}/5
                                </span>
                              </div>
                              {project.customerReview.reviewText && (
                                <p style={{ color: "#155724", marginTop: "8px", fontStyle: "italic", fontSize: "14px" }}>
                                  "{project.customerReview.reviewText}"
                                </p>
                              )}
                              <p style={{ color: "#666", fontSize: "11px", marginTop: "6px" }}>
                                Submitted: {new Date(project.customerReview.reviewDate).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <div style={{ 
                              marginTop: project.completionImages?.length > 0 ? "20px" : "0",
                              padding: "15px",
                              backgroundColor: "#fff",
                              borderRadius: "8px",
                              border: "2px dashed #4CAF50",
                              textAlign: "center"
                            }}>
                              <h4 style={{ color: "#2e7d32", marginBottom: "10px" }}>⭐ Rate & Review This Project</h4>
                              <p style={{ color: "#666", marginBottom: "15px", fontSize: "14px" }}>
                                Your feedback helps improve our service
                              </p>
                              <button
                                style={{
                                  backgroundColor: "#4CAF50",
                                  color: "white",
                                  border: "none",
                                  padding: "12px 30px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                  fontSize: "16px",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                }}
                                onClick={() => {
                                  toggleMilestones(project._id);
                                  setTimeout(() => {
                                    document.getElementById(`milestones-${project._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                  }, 100);
                                }}
                              >
                                Write Your Review
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                    {/* EXPANDABLE RECENT UPDATES */}
                  <div
                    className={`co-view-details ${
                      expandedUpdates[project._id] ? "active" : ""
                    }`}
                    id={`updates-${project._id}`}
                    style={{
                      border: expandedUpdates[project._id] ? "2px solid #ddd" : "none",
                      borderRadius: "12px",
                      padding: expandedUpdates[project._id] ? "20px" : "0",
                      marginTop: expandedUpdates[project._id] ? "15px" : "0",
                      backgroundColor: expandedUpdates[project._id] ? "#f9f9f9" : "transparent",
                      boxShadow: expandedUpdates[project._id] ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none"
                    }}
                  >
                    {/* Recent Updates */}
                    <h3 style={{ 
                      color: "#333", 
                      borderBottom: "2px solid #6c757d", 
                      paddingBottom: "10px",
                      marginBottom: "20px" 
                    }}>Recent Updates</h3>
                    <div className="co-recent-updates">
                      {project.recentUpdates && project.recentUpdates.length > 0 ? (
                        project.recentUpdates.map((update, i) => (
                          <div key={i} className="co-update" style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "15px",
                            marginBottom: "15px",
                            backgroundColor: "#fff"
                          }}>
                            {update.updateImagePath && (
                              <img
                                src={update.updateImagePath}
                                alt="Update"
                                style={{
                                  borderRadius: "8px",
                                  marginBottom: "10px",
                                  maxWidth: "100%"
                                }}
                              />
                            )}
                            <div>
                              <p><strong>Description:</strong></p>
                              <p>{update.updateText}</p>
                              <p style={{ fontSize: "0.85em", color: "#666", marginTop: "5px" }}>
                                {new Date(update.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="co-update">
                          <p>No recent updates yet.</p>
                        </div>
                      )}
                    </div>

                    {/* All Images */}
                    <h3 style={{ 
                      color: "#333", 
                      borderBottom: "2px solid #6c757d", 
                      paddingBottom: "10px",
                      marginBottom: "20px",
                      marginTop: "30px" 
                    }}>All Project Images</h3>
                    <div className="co-images" style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "15px"
                    }}>
                      {project.additionalImagePaths &&
                      project.additionalImagePaths.length > 0 ? (
                        project.additionalImagePaths.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt={`Additional ${i + 1}`}
                            style={{
                              borderRadius: "8px",
                              border: "2px solid #e0e0e0",
                              objectFit: "cover",
                              width: "100%",
                              height: "200px"
                            }}
                          />
                        ))
                      ) : (
                        <p>No images uploaded yet</p>
                      )}
                    </div>
                  </div>

                    {/* EXPANDABLE MILESTONES */}
                  <div
                    className={`co-view-details ${
                      expandedMilestones[project._id] ? "active" : ""
                    }`}
                    id={`milestones-${project._id}`}
                    style={{
                      border: expandedMilestones[project._id] ? "2px solid #ddd" : "none",
                      borderRadius: "12px",
                      padding: expandedMilestones[project._id] ? "20px" : "0",
                      marginTop: expandedMilestones[project._id] ? "15px" : "0",
                      backgroundColor: expandedMilestones[project._id] ? "#f9f9f9" : "transparent",
                      boxShadow: expandedMilestones[project._id] ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none"
                    }}
                  >
                    {/* Milestone Progress Section */}
                    {project.milestones && project.milestones.length > 0 ? (
                      <>
                        <h3 style={{ 
                          color: "#333", 
                          borderBottom: "2px solid #6c757d", 
                          paddingBottom: "10px",
                          marginBottom: "20px" 
                        }}>Project Milestones & Progress Reports</h3>
                        <div className="co-milestones-list" style={{ marginBottom: "20px" }}>
                          {(() => {
  const nextPendingMilestone = project.milestones
    .sort((a, b) => a.percentage - b.percentage)
    .filter(m => m.isCheckpoint && !m.isApprovedByCustomer && !m.needsRevision)[0]?.percentage;
  return project.milestones
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
                                {([25, 50, 75, 100].includes(milestone.percentage)) && (
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ 
                                        backgroundColor: milestone.isApprovedByCustomer ? '#ccc' : '#dc3545', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '8px 18px', 
                                        borderRadius: '6px', 
                                        cursor: milestone.isApprovedByCustomer ? 'not-allowed' : 'pointer', 
                                        fontWeight: '600', 
                                        fontSize: 14,
                                        opacity: milestone.isApprovedByCustomer ? 0.6 : 1
                                      }}
                                      onClick={() => !milestone.isApprovedByCustomer && handleOpenComplaint(project._id, milestone.percentage)}
                                      disabled={milestone.isApprovedByCustomer}
                                    >
                                      🚩 Report to Admin
                                    </button>
                                  </div>
                                )}

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
                                  <strong style={{ display: "block", marginBottom: "8px", color: "#555" }}>Latest Company Progress Report:</strong>
                                  <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.companyMessage}</p>
                                </div>
                                
                                {/* Conversation History */}
                                {milestone.conversation && milestone.conversation.length > 0 && (
                                  <div style={{
                                    backgroundColor: "#f8f9fa",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginTop: "10px",
                                    border: "1px solid #dee2e6"
                                  }}>
                                    <strong style={{ display: "block", marginBottom: "12px", color: "#555" }}>
                                      💬 Full Conversation ({milestone.conversation.length} {milestone.conversation.length === 1 ? 'message' : 'messages'})
                                    </strong>
                                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                      {milestone.conversation.map((msg, msgIdx) => (
                                        <div key={msgIdx} style={{
                                          backgroundColor: msg.sender === 'company' ? "#e3f2fd" : "#fff3e0",
                                          padding: "10px",
                                          borderRadius: "8px",
                                          marginBottom: "8px",
                                          borderLeft: `4px solid ${msg.sender === 'company' ? "#2196f3" : "#ff9800"}`
                                        }}>
                                          <div style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            marginBottom: "6px",
                                            fontSize: "0.85em",
                                            color: "#666"
                                          }}>
                                            <strong style={{ color: msg.sender === 'company' ? "#1976d2" : "#f57c00" }}>
                                              {msg.sender === 'company' ? '🏢 Company' : '👤 You'}
                                            </strong>
                                            <span>
                                              {new Date(msg.timestamp).toLocaleString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                              })}
                                            </span>
                                          </div>
                                          <p style={{ margin: 0, lineHeight: "1.5", color: "#333" }}>{msg.message}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {milestone.needsRevision && milestone.customerFeedback && (
                                  <div style={{
                                    backgroundColor: "#fff3cd",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginTop: "10px",
                                    border: "2px solid #ffc107"
                                  }}>
                                    <strong style={{ display: "block", marginBottom: "8px", color: "#856404" }}>⏳ Awaiting Company Response to Your Feedback:</strong>
                                    <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.customerFeedback}</p>
                                  </div>
                                )}
                                
                                {/* Action buttons for non-approved milestones (< 100%) */}
                                {!milestone.isApprovedByCustomer && !milestone.needsRevision && milestone.percentage === nextPendingMilestone && (
                                  <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                                      onClick={() => handleApproveMilestone(project._id, milestone.percentage)}
                                    >
                                      ✓ Approve & Proceed
                                    </button>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ backgroundColor: "#ffc107", color: "#333", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                                      onClick={() => setShowRevisionModal(`${project._id}_${milestone.percentage}`)}
                                    >
                                      📝 Request Revision
                                    </button>
                                  </div>
                                )}
                                
                                {/* Special handling for 100% milestone - Show Approve First, Then Review */}
                                {!milestone.isApprovedByCustomer && !milestone.needsRevision && milestone.percentage === 100 && (
                                  <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                                      onClick={() => handleApproveMilestone(project._id, milestone.percentage)}
                                    >
                                      ✓ Approve & Complete Project
                                    </button>
                                    <button
                                      className="co-view-details-btn"
                                      style={{ backgroundColor: "#ffc107", color: "#333", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                                      onClick={() => setShowRevisionModal(`${project._id}_${milestone.percentage}`)}
                                    >
                                      📝 Request Changes
                                    </button>
                                  </div>
                                )}
                                
                                {/* Review & Rating Form - Only show after 100% is approved and review not submitted yet */}
                                {milestone.isApprovedByCustomer && milestone.percentage === 100 && !project.customerReview?.rating && (
                                  <div style={{
                                    marginTop: "20px",
                                    padding: "15px",
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    border: "2px solid #4CAF50"
                                  }}>
                                    <h4 style={{ color: "#2e7d32", marginBottom: "15px" }}>⭐ Rate & Review This Project</h4>
                                    <p style={{ color: "#666", marginBottom: "15px", fontSize: "14px" }}>Share your experience with this construction project</p>
                                    
                                    <div style={{ marginBottom: "15px" }}>
                                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                                        Your Rating *
                                      </label>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span
                                            key={star}
                                            style={{
                                              fontSize: "32px",
                                              cursor: "pointer",
                                              color: star <= (hoveredRating[project._id] || reviewRating[project._id] || 0) ? "#ffc107" : "#ddd",
                                              transition: "color 0.2s"
                                            }}
                                            onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [project._id]: star }))}
                                            onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [project._id]: 0 }))}
                                            onClick={() => setReviewRating(prev => ({ ...prev, [project._id]: star }))}
                                          >
                                            ★
                                          </span>
                                        ))}
                                        {reviewRating[project._id] && (
                                          <span style={{ marginLeft: "10px", fontWeight: "600", color: "#2e7d32" }}>
                                            {reviewRating[project._id]}/5
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div style={{ marginBottom: "15px" }}>
                                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                                        Your Review (Optional)
                                      </label>
                                      <textarea
                                        style={{
                                          width: "100%",
                                          padding: "10px",
                                          borderRadius: "6px",
                                          border: "1px solid #ddd",
                                          minHeight: "100px",
                                          resize: "vertical",
                                          fontFamily: "inherit"
                                        }}
                                        placeholder="Share your experience with the construction quality, timeline, communication, etc..."
                                        value={reviewText[project._id] || ""}
                                        onChange={(e) => setReviewText(prev => ({ ...prev, [project._id]: e.target.value }))}
                                      />
                                    </div>
                                    
                                    <div style={{ display: "flex", gap: "10px" }}>
                                      <button
                                        className="co-view-details-btn"
                                        style={{
                                          backgroundColor: "#4CAF50",
                                          color: "white",
                                          border: "none",
                                          padding: "10px 20px",
                                          borderRadius: "6px",
                                          cursor: "pointer",
                                          fontWeight: "600"
                                        }}
                                        onClick={() => handleSubmitReview(project._id)}
                                      >
                                        Submit Review
                                      </button>
                                    </div>
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
                            ));
                        })()}
                        </div>
                      </>
                    ) : (
                      <div className="co-no-projects">
                        <p>No milestones have been submitted yet.</p>
                      </div>
                    )}
                  </div>

                    {/* EXPANDABLE PROJECT DETAILS */}
                  <div
                    className={`co-view-details ${
                      expandedDetails[project._id] ? "active" : ""
                    }`}
                    id={`details-${project._id}`}
                    style={{
                      border: expandedDetails[project._id] ? "2px solid #ddd" : "none",
                      borderRadius: "12px",
                      padding: expandedDetails[project._id] ? "20px" : "0",
                      marginTop: expandedDetails[project._id] ? "15px" : "0",
                      backgroundColor: expandedDetails[project._id] ? "#f9f9f9" : "transparent",
                      boxShadow: expandedDetails[project._id] ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none"
                    }}
                  >
                    {/* Project Submission Details */}
                    <div className="co-project-submission-details">
                      <h3 style={{ 
                        color: "#333", 
                        borderBottom: "2px solid #6c757d", 
                        paddingBottom: "10px",
                        marginBottom: "20px" 
                      }}>Project Submission Details</h3>

                      <div className="co-section" style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "15px",
                        backgroundColor: "#fff"
                      }}>
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

                      <div className="co-section" style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "15px",
                        backgroundColor: "#fff"
                      }}>
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

                      <div className="co-section" style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "15px",
                        backgroundColor: "#fff"
                      }}>
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

                      <div className="co-section" style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "15px",
                        backgroundColor: "#fff"
                      }}>
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
              <h2>Filter Projects</h2>
              <button
                className={`co-filter-button ${
                  filter === "all" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("all")}
              >
                All Projects
              </button>
              <button
                className={`co-filter-button ${
                  filter === "pending" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("pending")}
              >
                Pending Projects
              </button>
              <button
                className={`co-filter-button ${
                  filter === "finished" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("finished")}
              >
                Finished Projects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      <Modal
        isOpen={!!showComplaintModal}
        onRequestClose={handleCloseComplaint}
        contentLabel="Complaint Modal"
        ariaHideApp={false}
        style={{
          overlay: { zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.4)' },
          content: {
            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
            marginRight: '-50%', transform: 'translate(-50%, -50%)',
            borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '400px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
          }
        }}
      >
        <h2 style={{ marginBottom: 18 }}>Report/Complaint</h2>
        <button onClick={handleCloseComplaint} style={{ position: 'absolute', top: 16, right: 20, fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
        <div style={{ margin: '20px 0' }}>
          <textarea
            rows={4}
            style={{ width: '100%', borderRadius: 6, border: '1px solid #aaa', padding: 10, fontSize: 15 }}
            placeholder="Describe your complaint or issue..."
            value={complaintText[showComplaintModal] || ''}
            onChange={e => setComplaintText(prev => ({ ...prev, [showComplaintModal]: e.target.value }))}
          />
        </div>
        {complaintError && <div style={{ color: 'red', marginBottom: 10 }}>{complaintError}</div>}
        {complaintSuccess && <div style={{ color: 'green', marginBottom: 10 }}>Complaint submitted successfully!</div>}
        <button
          onClick={() => {
            const [projectId, milestone] = showComplaintModal.split('_');
            handleSubmitComplaint(projectId, milestone);
          }}
          disabled={complaintLoading || !(complaintText[showComplaintModal] && complaintText[showComplaintModal].trim())}
          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '6px', fontWeight: '600', width: '100%', fontSize: 16 }}
        >
          {complaintLoading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </Modal>
    </>
  );
};

export default CustomerOngoing;