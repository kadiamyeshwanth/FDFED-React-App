// src/Pages/company/components/company-dashboard/CompanyDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CompanyDashboard.css";

const CompanyDashboard = () => {
  const [data, setData] = useState({
    activeProjects: 0,
    completedProjects: 0,
    revenue: 0,
    bids: [],
    projects: [],
    calculateProgress: () => 0,
    calculateDaysRemaining: () => 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/companydashboard", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load dashboard");

        const backendData = await res.json();

        const calculateProgress = (startDate, timeline) => {
          try {
            const totalMonths = parseInt(timeline, 10);
            if (isNaN(totalMonths) || totalMonths <= 0) return 0;
            const start = new Date(startDate);
            const now = new Date();
            const end = new Date(start);
            end.setMonth(end.getMonth() + totalMonths);
            if (now >= end) return 100;
            if (now <= start) return 0;
            const totalDuration = end.getTime() - start.getTime();
            const elapsedDuration = now.getTime() - start.getTime();
            return Math.floor((elapsedDuration / totalDuration) * 100);
          } catch {
            return 0;
          }
        };

        const calculateDaysRemaining = (startDate, timeline) => {
          try {
            const totalMonths = parseInt(timeline, 10);
            if (isNaN(totalMonths) || totalMonths <= 0) return 0;
            const start = new Date(startDate);
            const now = new Date();
            const end = new Date(start);
            end.setMonth(end.getMonth() + totalMonths);
            if (now >= end) return 0;
            const diffTime = end.getTime() - now.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          } catch {
            return 0;
          }
        };

        setData({
          ...backendData,
          calculateProgress,
          calculateDaysRemaining,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModal = (bid) => {
    setSelectedBid(bid);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBid(null);
  };

  const handleAcceptBid = async () => {
    if (!selectedBid) return;
    
    const proposedPrice = prompt(
      `Enter your proposed price (must be ≤ ₹${selectedBid.estimatedBudget?.toLocaleString("en-IN") || "N/A"}):`,
      ""
    );

    if (!proposedPrice) return; // User cancelled

    const price = parseFloat(proposedPrice);

    // Validation
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price greater than zero.");
      return;
    }

    if (selectedBid.estimatedBudget && price > selectedBid.estimatedBudget) {
      alert(
        `Price (₹${price.toLocaleString("en-IN")}) exceeds the budget (₹${selectedBid.estimatedBudget.toLocaleString("en-IN")}). Please enter a lower price.`
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/company/submit-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bidId: selectedBid._id,
          bidPrice: price,
        }),
      });

      if (res.ok) {
        alert("Bid submitted successfully!");
        closeModal();
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit bid.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  const updateProjectStatus = async (bidId, status) => {
    const apiRoute = `/api/company/projects/${bidId}/${status}`;
    try {
      const res = await fetch(apiRoute, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert(`Bid status updated to ${status} successfully!`);
        window.location.reload();
      } else {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update bid status.");
    }
  };

  if (loading) return <div className="cdb-loading">Loading Dashboard...</div>;
  if (error) return <div className="cdb-error">Error: {error}</div>;

  const {
    activeProjects,
    completedProjects,
    revenue,
    bids,
    projects,
    calculateProgress,
    calculateDaysRemaining,
  } = data;

  const pendingProjects = projects.filter(p => p.status === "pending");
  const acceptedProjects = projects.filter(p => p.status === "accepted");

  return (
    <>
      <div className="cdb-main-container">
        <h1 className="cdb-page-title">Revenue Management</h1>

        {/* Stats */}
        <div className="cdb-stats-container">
          <div className="cdb-stat-card">
            <h3>Active Projects</h3>
            <div className="cdb-stat-value">{activeProjects}</div>
          </div>
          <div className="cdb-stat-card">
            <h3>Completed Projects</h3>
            <div className="cdb-stat-value">{completedProjects}</div>
          </div>
          <div className="cdb-stat-card">
            <h3>Total Revenue</h3>
            <div className="cdb-stat-value">₹{revenue.toLocaleString("en-IN")}</div>
          </div>
        </div>

        {/* New Bids */}
        <div className="cdb-section-header">
          <h2 className="cdb-section-title">New Bids</h2>
          <div className="cdb-view-all">
            <Link to="/companybids">View All</Link>
          </div>
        </div>

        <div className="cdb-cards-container">
          {bids.length === 0 ? (
            <p>No new bids available.</p>
          ) : (
            bids.map((bid) => (
              <div
                key={bid._id}
                className="cdb-bid-card"
                data-bid-details={JSON.stringify(bid)}
              >
                <h3>{bid.projectName || "N/A"}</h3>
                <div className="cdb-bid-info">
                  <p><span>Client:</span><span>{bid.customerName}</span></p>
                  <p><span>Location:</span><span>{bid.projectLocation}</span></p>
                  <p><span>Budget:</span><span>₹{bid.estimatedBudget?.toLocaleString("en-IN") || "TBD"}</span></p>
                  <p><span>Timeline:</span><span>{bid.projectTimeline ? `${bid.projectTimeline} months` : "TBD"}</span></p>
                  <p><span>Due Date:</span><span>{new Date(bid.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></p>
                </div>
                <div className="cdb-bid-actions">
                  <button className="cdb-btn cdb-btn-primary" onClick={() => openModal(bid)}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Projects */}
        <div className="cdb-section-header">
          <h2 className="cdb-section-title">New Projects</h2>
          <div className="cdb-view-all">
            <Link to="/project_requests">View All</Link>
          </div>
        </div>

        <div className="cdb-cards-container">
          {pendingProjects.length === 0 ? (
            <p>No new project requests.</p>
          ) : (
            pendingProjects.map((project) => (
              <div key={project._id} className="cdb-bid-card">
                <h3>{project.projectName}</h3>
                <div className="cdb-bid-info">
                  <p><span>Client:</span><span>{project.customerName}</span></p>
                  <p><span>Location:</span><span>{project.projectAddress}</span></p>
                  <p><span>Budget:</span><span>₹{project.estimatedBudget?.toLocaleString("en-IN") || "TBD"}</span></p>
                  <p><span>Timeline:</span><span>{project.projectTimeline ? `${project.projectTimeline} months` : "TBD"}</span></p>
                  <p><span>Due Date:</span><span>{new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></p>
                </div>
                <div className="cdb-bid-actions" style={{ display: "none" }}>
                  <button className="cdb-btn cdb-btn-primary">View Details</button>
                  <button className="cdb-btn cdb-btn-secondary">Decline</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Project Timeline */}
        <div className="cdb-section-header" style={{ marginTop: "2rem" }}>
          <h2 className="cdb-section-title">Project Timeline</h2>
          <div className="cdb-view-all">
            <Link to="/companyongoing_projects">View All Projects</Link>
          </div>
        </div>

        <div className="cdb-timeline-container">
          {acceptedProjects.length === 0 ? (
            <p>No ongoing projects.</p>
          ) : (
            acceptedProjects.map((project) => {
              const progress = calculateProgress(project.createdAt, project.projectTimeline);
              const daysLeft = calculateDaysRemaining(project.createdAt, project.projectTimeline);
              const isDelayed = progress < 50;

              return (
                <div key={project._id} className="cdb-timeline-project">
                  <div className="cdb-project-info">
                    <h3>{project.projectName}</h3>
                    <div className="cdb-project-details">
                      <p>Client: <span>{project.customerName}</span></p>
                      <p>Start: <span>{new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></p>
                      <p>End: <span>
                        {project.projectTimeline
                          ? new Date(new Date(project.createdAt).setMonth(new Date(project.createdAt).getMonth() + project.projectTimeline))
                              .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "TBD"}
                      </span></p>
                    </div>
                    <div className="cdb-progress-container">
                      <div
                        className="cdb-progress-bar"
                        style={{ "--progress": progress }}
                      ></div>
                    </div>
                    <div className="cdb-progress-info">
                      <span>Progress: {progress}%</span>
                      <span>{daysLeft} days remaining</span>
                    </div>
                  </div>
                  <div className={`cdb-project-status ${isDelayed ? "status-delayed" : ""}`}>
                    {isDelayed ? "Delayed" : "On Track"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bid Review Modal */}
      {showModal && selectedBid && (
        <div className="cdb-bid-review-modal-backdrop visible" onClick={closeModal}>
          <div className="cdb-bid-review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cdb-bid-review-modal-header">
              <h2 className="cdb-modal-title">{selectedBid.projectAddress || "Project Details"}</h2>
              <button className="cdb-modal-close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="cdb-bid-review-modal-body">
              <div className="cdb-detail-section">
                <h3>Customer Information</h3>
                <div className="cdb-detail-grid">
                  <p><strong>Client Name:</strong> <span>{selectedBid.customerName || "N/A"}</span></p>
                  <p><strong>Email:</strong> <span>{selectedBid.customerEmail || "N/A"}</span></p>
                  <p><strong>Phone:</strong> <span>{selectedBid.customerPhone || "N/A"}</span></p>
                </div>
              </div>

              <div className="cdb-detail-section">
                <h3>Project Specifications</h3>
                <div className="cdb-detail-grid">
                  <p><strong>Location Code:</strong> <span>{selectedBid.projectLocation || "N/A"}</span></p>
                  <p><strong>Total Area (sq. ft):</strong> <span>{selectedBid.totalArea || "N/A"}</span></p>
                  <p><strong>Building Type:</strong> <span>{selectedBid.buildingType || "N/A"}</span></p>
                  <p><strong>Total Floors:</strong> <span>{selectedBid.totalFloors || "N/A"}</span></p>
                  <p><strong>Est. Budget:</strong> <span>₹{selectedBid.estimatedBudget?.toLocaleString("en-IN") || "N/A"}</span></p>
                  <p><strong>Est. Timeline:</strong> <span>{selectedBid.projectTimeline ? `${selectedBid.projectTimeline} months` : "N/A"}</span></p>
                </div>
              </div>

              <div className="cdb-detail-section">
                <h3>Additional Requirements</h3>
                <div className="cdb-detail-grid cdb-full">
                  <p><strong>Special Requirements:</strong> <span>{selectedBid.specialRequirements || "None"}</span></p>
                  <p><strong>Accessibility Needs:</strong> <span>{selectedBid.accessibilityNeeds || "None"}</span></p>
                  <p><strong>Energy Efficiency:</strong> <span>{selectedBid.energyEfficiency || "Standard"}</span></p>
                </div>
              </div>

              <div className="cdb-detail-section">
                <h3>Attached Site Files</h3>
                <div className="cdb-site-files-list">
                  {selectedBid.siteFiles && selectedBid.siteFiles.length > 0 ? (
                    selectedBid.siteFiles.map((file, idx) => (
                      <a key={idx} href={file} target="_blank" rel="noopener noreferrer">
                        {file.split("/").pop()}
                      </a>
                    ))
                  ) : (
                    <span>No files attached.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="cdb-bid-review-modal-footer">
              <button className="cdb-btn cdb-btn-primary" onClick={handleAcceptBid}>
                Submit Bid
              </button>
              <Link to="/companydashboard/companybids">
                <button className="cdb-btn cdb-btn-secondary">View All Bids</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyDashboard;