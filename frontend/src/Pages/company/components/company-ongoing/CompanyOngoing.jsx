// src/pages/company/CompanyOngoing.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import "./CompanyOngoing.css";

const CompanyOngoing = () => {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedUpdates, setExpandedUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(null); // key: `${projectId}_${milestone}`
  const [complaintText, setComplaintText] = useState({});
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [complaintError, setComplaintError] = useState(null);
  const [unviewedComplaints, setUnviewedComplaints] = useState({}); // { projectId: count }

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
        
        // Fetch unviewed complaints count (from customers)
        try {
          const complaintsRes = await fetch('http://localhost:3000/api/company/unviewed-customer-messages', {
            credentials: 'include'
          });
          if (complaintsRes.ok) {
            const complaintsData = await complaintsRes.json();
            console.log('🔔 Unviewed customer messages data:', complaintsData);
            const complaintsMap = {};
            complaintsData.unviewedByProject.forEach(item => {
              complaintsMap[item._id] = item.count;
            });
            console.log('🔔 Messages map:', complaintsMap);
            setUnviewedComplaints(complaintsMap);
          }
        } catch (complaintsErr) {
          console.error('Error fetching unviewed customer messages:', complaintsErr);
        }
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
    if (filter === "finished") return p.completionPercentage === 100;
    if (filter === "pending") return p.completionPercentage < 100;
    return true;
  });

  /* -------------------------------------------------
   *  Toggle Details / Updates (mutual exclusion)
   * -------------------------------------------------*/
  const toggleDetails = (id) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
    setExpandedUpdates((prev) => ({ ...prev, [id]: false }));
  };

  const toggleUpdates = async (id) => {
    const wasExpanded = expandedUpdates[id];
    setExpandedUpdates((prev) => ({ ...prev, [id]: !prev[id] }));
    setExpandedDetails((prev) => ({ ...prev, [id]: false }));
    
    // Mark customer messages as viewed when opening milestone details
    if (!wasExpanded && unviewedComplaints[id]) {
      // Clear the notification immediately for better UX
      setUnviewedComplaints(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      
      try {
        await fetch(`http://localhost:3000/api/company/mark-messages-viewed/${id}`, {
          method: 'POST',
          credentials: 'include'
        });
        console.log('✅ Messages marked as viewed for project:', id);
      } catch (err) {
        console.error('Error marking messages as viewed:', err);
        // Restore notification if marking failed
        setUnviewedComplaints(prev => ({
          ...prev,
          [id]: 1
        }));
      }
    }
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
   *  Complaint Handling
   * -------------------------------------------------*/
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
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          milestone: milestone === 'general' ? 0 : milestone,
          senderType: 'company',
          senderId: projectId, // Replace with actual companyId if available in context
          message: complaintText[`${projectId}_${milestone}`]
        })
      });
      setComplaintSuccess(true);
      setComplaintText({});
    } catch (err) {
      setComplaintError('Failed to submit complaint');
    }
    setComplaintLoading(false);
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
                    {/* New Notification Box */}
                    {unviewedComplaints[project._id] && (
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
                        <span>New notification from customer - Check milestone updates</span>
                      </div>
                    )}
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
                      <button
                        className="ongoing-edit-btn"
                        style={{ backgroundColor: '#dc3545', color: 'white' }}
                        onClick={() => handleOpenComplaint(project._id, 'general')}
                      >
                        🚩 Report to Admin
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
                  
                  {/* Milestone Progress Section (only checkpoints: 25/50/75/100) */}
                  {project.milestones && project.milestones.length > 0 && (
                    <>
                      <h4 className="ongoing-updates-subtitle">Milestone Updates</h4>
                      <div className="milestones-list" style={{ marginBottom: "20px" }}>
                        {project.milestones
                          .sort((a, b) => a.percentage - b.percentage)
                          .filter((m) => m.isCheckpoint)
                          .map((milestone, idx) => (
                            <div key={idx} className="milestone-item" style={{
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
                                        ✓ Approved by Customer
                                      </span>
                                    ) : milestone.needsRevision ? (
                                      <span style={{ marginLeft: "10px", color: "#dc3545", fontSize: "0.9em" }}>
                                        ⚠ Revision Requested - Update Required
                                      </span>
                                    ) : (
                                      <span style={{ marginLeft: "10px", color: "#856404", fontSize: "0.9em" }}>
                                        ⏳ Awaiting Customer Approval
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
                                <strong style={{ display: "block", marginBottom: "8px", color: "#555" }}>Latest Company Message:</strong>
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
                                    💬 Conversation History ({milestone.conversation.length} {milestone.conversation.length === 1 ? 'message' : 'messages'})
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
                                            {msg.sender === 'company' ? '🏢 Company' : '👤 Customer'}
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
                                  <strong style={{ display: "block", marginBottom: "8px", color: "#856404" }}>⚠ Action Required - Customer Feedback:</strong>
                                  <p style={{ margin: 0, lineHeight: "1.6", color: "#333", marginBottom: "10px" }}>{milestone.customerFeedback}</p>
                                  <button
                                    className="ongoing-edit-btn"
                                    style={{ marginTop: "10px" }}
                                    onClick={() => navigate(`../addnewproject?projectId=${project._id}&updateCheckpoint=${milestone.percentage}`)}
                                  >
                                    📝 Respond & Update
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  
                  {/* Completion Images & Customer Review Section */}
                  {project.completionPercentage === 100 && (
                    <>
                      {/* Completion Images */}
                      {project.completionImages && project.completionImages.length > 0 && (
                        <div className="ongoing-section" style={{
                          backgroundColor: "#f8f9fa",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          padding: "15px",
                          marginTop: "15px"
                        }}>
                          <h4 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                            📸 Project Completion Photos
                          </h4>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                            gap: "12px"
                          }}>
                            {project.completionImages.map((img, idx) => (
                              <img
                                key={idx}
                                src={`http://localhost:3000/${img}`}
                                alt={`Completion ${idx + 1}`}
                                style={{
                                  width: "100%",
                                  height: "180px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
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
                      
                      {/* Customer Review */}
                      {project.customerReview?.rating && (
                        <div className="ongoing-section" style={{
                          backgroundColor: "#d4edda",
                      border: "2px solid #28a745",
                      borderRadius: "8px",
                      padding: "20px",
                      marginTop: "20px"
                    }}>
                      <h4 style={{ color: "#155724", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>⭐ Customer Review</span>
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ fontSize: "28px", color: star <= project.customerReview.rating ? "#ffc107" : "#ddd" }}>
                            ★
                          </span>
                        ))}
                        <span style={{ marginLeft: "12px", fontWeight: "700", color: "#155724", fontSize: "20px" }}>
                          {project.customerReview.rating}/5
                        </span>
                      </div>
                      {project.customerReview.reviewText && (
                        <div style={{
                          backgroundColor: "white",
                          padding: "15px",
                          borderRadius: "6px",
                          marginTop: "12px",
                          border: "1px solid #c3e6cb"
                        }}>
                          <p style={{ margin: 0, lineHeight: "1.6", color: "#333", fontStyle: "italic" }}>
                            "{project.customerReview.reviewText}"
                          </p>
                        </div>
                      )}
                      <p style={{ color: "#666", fontSize: "13px", marginTop: "12px", marginBottom: 0 }}>
                        <strong>Reviewed on:</strong> {new Date(project.customerReview.reviewDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                      )}
                    </>
                  )}
                  
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
            <h2>Filter Projects</h2>
            <button
              className={`ongoing-filter-button ${filter === "all" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("all")}
            >
              All Projects
            </button>
            <button
              className={`ongoing-filter-button ${filter === "pending" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("pending")}
            >
              Pending Projects
            </button>
            <button
              className={`ongoing-filter-button ${filter === "finished" ? "ongoing-active" : "ongoing-inactive"}`}
              onClick={() => handleFilter("finished")}
            >
              Finished Projects
            </button>
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
    </div>
  );
};

export default CompanyOngoing;