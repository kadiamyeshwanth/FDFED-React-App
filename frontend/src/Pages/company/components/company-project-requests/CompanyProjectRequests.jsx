import React, { useEffect, useState } from "react";
import "./CompanyProjectRequests.css";

const CompanyProjectRequests = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [maxBudget, setMaxBudget] = useState(0);
  const [proposalData, setProposalData] = useState({
    projectId: "",
    price: "",
    description: "",
  });
  const [proposalErrors, setProposalErrors] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/project_requests", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch project requests");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      proposal_sent: "Proposal Sent",
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProject(null);
  };

  const handleOpenProposalModal = (project) => {
    setSelectedProject(project);
    setMaxBudget(project.estimatedBudget || 0);
    setProposalData({
      projectId: project._id,
      price: "",
      description: "",
    });
    setProposalErrors({});
    setShowDetailsModal(false);
    setShowProposalModal(true);
  };

  const handleCloseProposalModal = () => {
    setShowProposalModal(false);
    setProposalData({ projectId: "", price: "", description: "" });
    setProposalErrors({});
  };

  const validatePrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    const errors = {};

    if (numPrice < 10000) {
      errors.price = "Price must be at least ₹10,000";
    } else if (maxBudget > 0 && numPrice > maxBudget) {
      errors.price = `Proposal price must be less than or equal to customer's budget (₹${maxBudget.toLocaleString("en-IN")})`;
    }

    return errors;
  };

  const validateDescription = (desc) => {
    const errors = {};
    const trimmed = desc.trim();

    if (trimmed === "") {
      errors.description = "Scope of work is required";
    } else if (trimmed.length < 10) {
      errors.description = "Scope of work must be at least 10 characters";
    }

    return errors;
  };

  const handleProposalChange = (e) => {
    const { name, value } = e.target;
    setProposalData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if user starts typing
    if (proposalErrors[name]) {
      setProposalErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    const priceErrors = validatePrice(proposalData.price);
    const descErrors = validateDescription(proposalData.description);
    const allErrors = { ...priceErrors, ...descErrors };

    if (Object.keys(allErrors).length > 0) {
      setProposalErrors(allErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/company/submit-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: proposalData.projectId,
          price: parseFloat(proposalData.price),
          description: proposalData.description,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit proposal");
      }

      alert("Proposal submitted successfully!");
      handleCloseProposalModal();
      fetchProjects(); // Refresh project list
    } catch (err) {
      console.error("Error submitting proposal:", err);
      alert(`Failed to submit proposal: ${err.message}`);
    }
  };

  const handleRejectProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to reject this project?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/company/api/projects/${projectId}/rejected`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reject project");
      }

      alert("Project rejected successfully!");
      handleCloseDetailsModal();
      fetchProjects(); // Refresh project list
    } catch (err) {
      console.error("Error rejecting project:", err);
      alert(`Failed to reject project: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="requests-container">
        <div className="requests-loading">Loading project requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="requests-container">
        <div className="requests-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="requests-main-dashboard">
      <div className="requests-dashboard-header">
        <h2 className="requests-dashboard-title">Project Submissions</h2>
      </div>

      {projects && projects.length > 0 ? (
        <div className="requests-cards-container">
          {projects.map((project) => (
            <div key={project._id} className="requests-card">
              <div className="requests-card-header">
                <h3>{project.projectName}</h3>
              </div>
              <div className="requests-card-body">
                <div className="requests-card-info">
                  <p>
                    <strong>Customer</strong>
                    <span>{project.customerName}</span>
                  </p>
                  <p>
                    <strong>Contact</strong>
                    <span>{project.customerPhone}</span>
                  </p>
                  <p>
                    <strong>Building Type</strong>
                    <span>
                      {project.buildingType
                        ? project.buildingType.charAt(0).toUpperCase() +
                          project.buildingType.slice(1)
                        : "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>Total Area</strong>
                    <span>{project.totalArea} sq.m</span>
                  </p>
                </div>
                <div className="requests-card-actions">
                  <button
                    className="requests-card-btn requests-btn-view"
                    onClick={() => handleViewDetails(project)}
                  >
                    <i className="fas fa-eye"></i> View Details
                  </button>
                </div>
                <div className="requests-card-actions" style={{ marginTop: "1rem" }}>
                  {project.status === "proposal_sent" ? (
                    <div style={{ color: "red", fontWeight: "600" }}>
                      ✓ Proposal already sent
                    </div>
                  ) : (
                    <>
                      <button
                        className="requests-card-btn requests-btn-accept requests-proposal-create-btn"
                        onClick={() => handleOpenProposalModal(project)}
                      >
                        <i className="fas fa-file-signature"></i> Create Proposal
                      </button>
                      <button
                        className="requests-card-btn requests-btn-reject"
                        onClick={() => handleRejectProject(project._id)}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="requests-no-projects">
          <p>No project submissions found.</p>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedProject && (
        <div className="requests-modal-backdrop requests-modal-active" onClick={handleCloseDetailsModal}>
          <div className="requests-modal" onClick={(e) => e.stopPropagation()}>
            <div className="requests-modal-header">
              <div>
                <span className="requests-modal-title">{selectedProject.projectName}</span>
                <span className={`requests-modal-status requests-status-${selectedProject.status}`}>
                  {getStatusText(selectedProject.status)}
                </span>
              </div>
              <button className="requests-modal-close" onClick={handleCloseDetailsModal}>
                ×
              </button>
            </div>
            <div className="requests-modal-body">
              {/* Customer Information */}
              <div className="requests-detail-section">
                <h3>Customer Information</h3>
                <div className="requests-detail-grid">
                  <div className="requests-detail-item">
                    <strong>Name:</strong>
                    <span>{selectedProject.customerName}</span>
                  </div>
                  <div className="requests-detail-item">
                    <strong>Email:</strong>
                    <span>{selectedProject.customerEmail}</span>
                  </div>
                  <div className="requests-detail-item">
                    <strong>Phone:</strong>
                    <span>{selectedProject.customerPhone}</span>
                  </div>
                  <div className="requests-detail-item">
                    <strong>Submission Date:</strong>
                    <span>{formatDate(selectedProject.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="requests-detail-section">
                <h3>Project Details</h3>
                <div className="requests-detail-grid">
                  <div className="requests-detail-item">
                    <strong>Building Type:</strong>
                    <span>
                      {selectedProject.buildingType
                        ? selectedProject.buildingType.charAt(0).toUpperCase() +
                          selectedProject.buildingType.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="requests-detail-item">
                    <strong>Total Area:</strong>
                    <span>{selectedProject.totalArea} sq.m</span>
                  </div>
                  {selectedProject.estimatedBudget && (
                    <div className="requests-detail-item">
                      <strong>Budget:</strong>
                      <span style={{ color: "#A06700" }}>
                        ₹{selectedProject.estimatedBudget.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {selectedProject.projectTimeline && (
                    <div className="requests-detail-item">
                      <strong>Timeline:</strong>
                      <span>{selectedProject.projectTimeline} months</span>
                    </div>
                  )}
                  <div className="requests-detail-item requests-detail-full">
                    <strong>Address:</strong>
                    <span>{selectedProject.projectAddress}</span>
                  </div>
                </div>
              </div>

              {/* Floor Plans */}
              <div className="requests-detail-section">
                <h3>Floor Plans ({selectedProject.floors ? selectedProject.floors.length : 0})</h3>
                {selectedProject.floors && selectedProject.floors.length > 0 ? (
                  selectedProject.floors.map((floor, idx) => (
                    <div key={idx} className="requests-floor-box">
                      <div className="requests-detail-grid">
                        <h4
                          style={{
                            gridColumn: "1 / -1",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                            paddingBottom: "0",
                            color: "#004D7A",
                            fontWeight: "700",
                          }}
                        >
                          Floor {floor.floorNumber}
                          <span className="requests-floor-badge">
                            {floor.floorType
                              ? floor.floorType.charAt(0).toUpperCase() +
                                floor.floorType.slice(1)
                              : "N/A"}
                          </span>
                        </h4>
                        <div className="requests-detail-item">
                          <strong>Area:</strong>
                          <span>{floor.floorArea} sq.m</span>
                        </div>
                        <div className="requests-detail-item">
                          <strong>Floor Type:</strong>
                          <span>
                            {floor.floorType
                              ? floor.floorType.charAt(0).toUpperCase() +
                                floor.floorType.slice(1)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="requests-detail-item requests-detail-full">
                          <strong>Description:</strong>
                          <span>{floor.floorDescription || "None provided"}</span>
                        </div>
                        {floor.floorImage && (
                          <div className="requests-detail-item requests-detail-full">
                            <strong>Floor Plan:</strong>
                            <img
                              src={floor.floorImage}
                              alt={`Floor ${floor.floorNumber} Plan`}
                              className="requests-floor-plan-image"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#6C757D" }}>
                    No detailed floor plans were provided.
                  </p>
                )}
              </div>

              {/* Additional Requirements */}
              <div className="requests-detail-section">
                <h3>Additional Requirements</h3>
                <div className="requests-detail-grid">
                  {selectedProject.specialRequirements && (
                    <div className="requests-detail-item requests-detail-full">
                      <strong>Special Requirements:</strong>
                      <span>{selectedProject.specialRequirements}</span>
                    </div>
                  )}
                  {selectedProject.accessibilityNeeds && (
                    <div className="requests-detail-item">
                      <strong>Accessibility Needs:</strong>
                      <span>
                        {selectedProject.accessibilityNeeds.charAt(0).toUpperCase() +
                          selectedProject.accessibilityNeeds.slice(1)}
                      </span>
                    </div>
                  )}
                  {selectedProject.energyEfficiency && (
                    <div className="requests-detail-item">
                      <strong>Energy Efficiency:</strong>
                      <span>
                        {selectedProject.energyEfficiency.charAt(0).toUpperCase() +
                          selectedProject.energyEfficiency.slice(1)}
                      </span>
                    </div>
                  )}
                  {selectedProject.siteFilepaths &&
                    selectedProject.siteFilepaths.length > 0 && (
                      <div className="requests-detail-item requests-detail-full">
                        <strong>Site Plans:</strong>
                        <div className="requests-file-links-container">
                          {selectedProject.siteFilepaths.map((path, idx) => (
                            <a
                              key={idx}
                              href={path}
                              className="requests-file-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-file-alt"></i>{" "}
                              {path.split("/").pop()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="requests-modal-actions">
                {selectedProject.status === "proposal_sent" ? (
                  <div style={{ color: "red", fontWeight: "600" }}>
                    ✓ Proposal already sent
                  </div>
                ) : (
                  <>
                    <button
                      className="requests-modal-btn requests-modal-btn-accept"
                      onClick={() => handleOpenProposalModal(selectedProject)}
                    >
                      <i className="fas fa-file-signature"></i> Create Proposal
                    </button>
                    <button
                      className="requests-modal-btn requests-modal-btn-reject"
                      onClick={() => {
                        handleCloseDetailsModal();
                        handleRejectProject(selectedProject._id);
                      }}
                    >
                      <i className="fas fa-times"></i> Reject Project
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSAL MODAL */}
      {showProposalModal && selectedProject && (
        <div className="requests-proposal-modal requests-proposal-modal-active" onClick={handleCloseProposalModal}>
          <div
            className="requests-proposal-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="requests-proposal-modal-header">
              <h3>Create Proposal</h3>
              <button className="requests-modal-close" onClick={handleCloseProposalModal}>
                ×
              </button>
            </div>
            <div className="requests-proposal-modal-body">
              <form onSubmit={handleSubmitProposal}>
                <div className="requests-proposal-form-group">
                  <label className="requests-proposal-form-label">
                    Project Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    className={`requests-proposal-form-control ${
                      proposalErrors.price ? "requests-input-error" : ""
                    }`}
                    min="10000"
                    step="10000"
                    value={proposalData.price}
                    onChange={handleProposalChange}
                  />
                  {proposalErrors.price && (
                    <div className="requests-error-message">{proposalErrors.price}</div>
                  )}
                  {maxBudget === 0 && !proposalErrors.price && (
                    <div className="requests-warning-message">
                      Note: Customer budget not specified. You can proceed with your proposal.
                    </div>
                  )}
                </div>

                <div className="requests-proposal-form-group">
                  <label className="requests-proposal-form-label">Scope of Work</label>
                  <textarea
                    name="description"
                    rows="4"
                    required
                    className={`requests-proposal-form-control ${
                      proposalErrors.description ? "requests-input-error" : ""
                    }`}
                    maxLength="2000"
                    value={proposalData.description}
                    onChange={handleProposalChange}
                  ></textarea>
                  <div className="requests-char-counter">
                    {proposalData.description.length}/2000 characters
                  </div>
                  {proposalErrors.description && (
                    <div className="requests-error-message">
                      {proposalErrors.description}
                    </div>
                  )}
                </div>

                <button type="submit" className="requests-proposal-btn-primary">
                  Send Proposal
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProjectRequests;
