import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminConstructionProjectDetail.css";
import Modal from "react-modal";

const AdminConstructionProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComplaints, setShowComplaints] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(null);
  const [activeTab, setActiveTab] = useState("customer");
  const [unviewedCount, setUnviewedCount] = useState(0);
  const apiBase = ""; // leave empty to use same origin or set VITE_API_URL

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/construction-project/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setProject(data.project ?? data);
      } catch (err) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    const fetchUnviewedCount = async () => {
      if (!project) return;
      try {
        const res = await fetch(`/api/complaints/unviewed/count`);
        const data = await res.json();
        if (data.success) {
          const projectUnviewed = data.unviewedByProject.find(
            (item) => item._id === project._id
          );
          setUnviewedCount(projectUnviewed ? projectUnviewed.count : 0);
        }
      } catch (err) {
        console.error('Error fetching unviewed count:', err);
      }
    };
    fetchUnviewedCount();
  }, [project]);

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    setComplaintsError(null);
    try {
      const res = await fetch(`/api/complaints/${project._id}`);
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch complaints");
      setComplaints(data.complaints || []);
    } catch (err) {
      setComplaintsError(err.message || "Error fetching complaints");
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleOpenComplaints = () => {
    setShowComplaints(true);
    fetchComplaints();
    setUnviewedCount(0); // Reset count when viewing
  };
  const handleCloseComplaints = () => {
    setShowComplaints(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this construction project?"))
      return;
    try {
      const res = await fetch(`/api/admin/delete-constructionProject/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Project deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting project: " + err.message);
    }
  };

  if (loading) return <div className="acp-loading">Loading project…</div>;
  if (error) return <div className="acp-error">Error: {error}</div>;
  if (!project) return <div className="acp-empty">Project not found.</div>;

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "Not specified");
  const fmtShort = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtNum = (n) =>
    typeof n === "number" ? n.toLocaleString() : n ?? "Not specified";
  const pct = Math.min(
    Math.max(Number(project.completionPercentage) || 0, 0),
    100
  );

  return (
    <div className="acp-container">
      <header className="acp-header">
        <h1 className="acp-title">🏗️ Construction Project Details</h1>
        <div className="acp-actions">
          <button
            className="acp-btn acp-back"
            onClick={() => navigate("/admin/admindashboard")}
          >
            ← Back to Dashboard
          </button>
          <button className="acp-btn acp-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
          <button
            className="acp-btn acp-complaints"
            onClick={handleOpenComplaints}
            style={{ position: 'relative' }}
          >
            📝 Complaints
            {unviewedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '2px solid white'
              }}>
                {unviewedCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="acp-card">
        <section className="acp-section acp-section-header">
          <h2 className="acp-section-title">
            {project.projectName ?? "Construction Project"}
          </h2>
          <p className="acp-subtitle">Project ID: {project._id}</p>
        </section>

        <h3 className="acp-section-heading">Project Status</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Status</label>
            <div className="acp-value">
              <span
                className={`acp-badge acp-badge-${String(
                  project.status ?? ""
                ).toLowerCase()}`}
              >
                {project.status ?? "—"}
              </span>
            </div>
          </div>

          <div className="acp-item">
            <label className="acp-label">Current Phase</label>
            <div className="acp-value">
              {project.currentPhase ?? "Not specified"}
            </div>
          </div>

          <div className="acp-item">
            <label className="acp-label">Completion Percentage</label>
            <div className="acp-value">
              {pct}%
              <div className="acp-progress-bar" aria-hidden>
                <div className="acp-progress-fill" style={{ width: `${pct}%` }}>
                  {pct}%
                </div>
              </div>
            </div>
          </div>

          <div className="acp-item">
            <label className="acp-label">Target Completion Date</label>
            <div className="acp-value">
              {fmtShort(project.targetCompletionDate)}
            </div>
          </div>
        </div>

        <h3 className="acp-section-heading">Customer Information</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Customer Name</label>
            <div className="acp-value">
              {project.customerName ?? project.customerId?.name ?? "—"}
            </div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Email</label>
            <div className="acp-value">
              {project.customerEmail ?? project.customerId?.email ?? "—"}
            </div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Phone</label>
            <div className="acp-value">
              {project.customerPhone ?? project.customerId?.phone ?? "—"}
            </div>
          </div>
        </div>

        <h3 className="acp-section-heading">Project Details</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Building Type</label>
            <div className="acp-value">{project.buildingType ?? "—"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Total Area</label>
            <div className="acp-value">{fmtNum(project.totalArea)} sq ft</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Total Floors</label>
            <div className="acp-value">{project.totalFloors ?? "—"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Estimated Budget</label>
            <div className="acp-value">₹{fmtNum(project.estimatedBudget)}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Project Timeline</label>
            <div className="acp-value">
              {project.projectTimeline ?? "—"} months
            </div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Accessibility Needs</label>
            <div className="acp-value">
              {project.accessibilityNeeds ?? "None"}
            </div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Energy Efficiency</label>
            <div className="acp-value">
              {project.energyEfficiency ?? "Standard"}
            </div>
          </div>

          <div className="acp-item acp-full">
            <label className="acp-label">Project Address</label>
            <div className="acp-value">{project.projectAddress ?? "—"}</div>
          </div>

          {project.projectLocationPincode && (
            <div className="acp-item">
              <label className="acp-label">Pincode</label>
              <div className="acp-value">{project.projectLocationPincode}</div>
            </div>
          )}

          {project.specialRequirements && (
            <div className="acp-item acp-full">
              <label className="acp-label">Special Requirements</label>
              <div className="acp-value">{project.specialRequirements}</div>
            </div>
          )}
        </div>

        {Array.isArray(project.floors) && project.floors.length > 0 && (
          <>
            <h3 className="acp-section-heading">
              Floor Details ({project.floors.length})
            </h3>
            {project.floors.map((floor, i) => (
              <div className="acp-floor-card" key={i}>
                <strong>Floor {floor.floorNumber}:</strong> {floor.floorType} |{" "}
                {floor.floorArea} sq ft
                {floor.floorDescription && (
                  <div className="acp-floor-desc">{floor.floorDescription}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Milestones Section */}
        {Array.isArray(project.milestones) && project.milestones.length > 0 && (
          <>
            <h3 className="acp-section-heading">
              Project Milestones & Progress ({project.milestones.filter(m => m.isCheckpoint).length})
            </h3>
            {project.milestones
              .filter((m) => m.isCheckpoint)
              .sort((a, b) => a.percentage - b.percentage)
              .map((milestone, idx) => (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: milestone.isApprovedByCustomer ? "#d4edda" : milestone.needsRevision ? "#ffe6e6" : "#fff3cd",
                    border: `2px solid ${milestone.isApprovedByCustomer ? "#28a745" : milestone.needsRevision ? "#dc3545" : "#ffc107"}`,
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ margin: 0, color: "#333", fontSize: "18px" }}>
                      {milestone.percentage}% Milestone
                      {milestone.isApprovedByCustomer ? (
                        <span style={{ marginLeft: "10px", color: "#28a745", fontSize: "0.85em", fontWeight: "600" }}>
                          ✓ Approved by Customer
                        </span>
                      ) : milestone.needsRevision ? (
                        <span style={{ marginLeft: "10px", color: "#dc3545", fontSize: "0.85em", fontWeight: "600" }}>
                          ⚠ Revision Requested
                        </span>
                      ) : (
                        <span style={{ marginLeft: "10px", color: "#856404", fontSize: "0.85em", fontWeight: "600" }}>
                          ⏳ Awaiting Customer Approval
                        </span>
                      )}
                    </h4>
                  </div>

                  <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "12px" }}>
                    <strong>Submitted:</strong> {fmt(milestone.submittedAt)}
                    {milestone.approvedAt && (
                      <span style={{ marginLeft: "15px" }}>
                        | <strong>Approved:</strong> {fmt(milestone.approvedAt)}
                      </span>
                    )}
                  </div>

                  <div style={{
                    backgroundColor: "white",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "12px"
                  }}>
                    <strong style={{ display: "block", marginBottom: "8px", color: "#555" }}>Company Progress Report:</strong>
                    <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.companyMessage}</p>
                  </div>

                  {/* Conversation History */}
                  {milestone.conversation && milestone.conversation.length > 0 && (
                    <div style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "6px",
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
                      <strong style={{ display: "block", marginBottom: "8px", color: "#856404" }}>Customer Feedback for Revision:</strong>
                      <p style={{ margin: 0, lineHeight: "1.6", color: "#333" }}>{milestone.customerFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
          </>
        )}

        <h3 className="acp-section-heading">Timestamps</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Created At</label>
            <div className="acp-value">{fmt(project.createdAt)}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Last Updated</label>
            <div className="acp-value">{fmt(project.updatedAt)}</div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showComplaints}
        onRequestClose={handleCloseComplaints}
        contentLabel="Complaints Modal"
        ariaHideApp={false}
        style={{
          overlay: { 
            zIndex: 1000, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '85vh',
            borderRadius: '12px',
            padding: '0',
            border: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px 24px', 
          borderBottom: '2px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '22px' }}>📝 Project Complaints</h2>
          <button
            onClick={handleCloseComplaints}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: 1,
              padding: 0
            }}
          >
            ✖
          </button>
        </div>
        
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setActiveTab("customer")}
            style={{
              padding: '10px 24px',
              border: activeTab === "customer" ? '2px solid #007bff' : '2px solid #ddd',
              backgroundColor: activeTab === "customer" ? '#e7f3ff' : '#fff',
              color: activeTab === "customer" ? '#007bff' : '#666',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            👤 Customer Complaints
          </button>
          <button
            onClick={() => setActiveTab("company")}
            style={{
              padding: '10px 24px',
              border: activeTab === "company" ? '2px solid #28a745' : '2px solid #ddd',
              backgroundColor: activeTab === "company" ? '#e8f5e9' : '#fff',
              color: activeTab === "company" ? '#28a745' : '#666',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            🏢 Company Complaints
          </button>
        </div>
        
        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(85vh - 180px)' }}>
          {complaintsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading complaints…
            </div>
          ) : complaintsError ? (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}>
              ⚠️ {complaintsError}
            </div>
          ) : complaints.filter((c) => c.senderType === activeTab).length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#999',
              fontSize: '16px'
            }}>
              No {activeTab} complaints found for this project.
            </div>
          ) : (
            complaints
              .filter((c) => c.senderType === activeTab)
              .map((c) => (
                <div
                  key={c._id}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    padding: '16px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <div style={{ 
                      display: 'inline-block',
                      backgroundColor: '#ffc107',
                      color: '#333',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      📍 {c.milestone === 0 ? 'General Complaint' : `Milestone: ${c.milestone}%`}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      {new Date(c.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      marginBottom: '6px',
                      fontWeight: '600'
                    }}>
                      COMPLAINT MESSAGE:
                    </div>
                    <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>
                      {c.message}
                    </div>
                  </div>
                  

                </div>
              ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminConstructionProjectDetail;
