import React, { useEffect, useState } from "react";
import "./CompanyRevenue.css";

const CompanyRevenue = () => {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/companyrevenue", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch revenue data");
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

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const calculateEndDate = (project) => {
    if (project.status === "completed") {
      return formatDate(project.updatedAt);
    }
    if (project.projectTimeline) {
      const endDate = new Date(project.createdAt);
      endDate.setMonth(endDate.getMonth() + parseInt(project.projectTimeline));
      return formatDate(endDate);
    }
    return "N/A";
  };

  if (loading) {
    return (
      <div className="revenue-container">
        <div className="revenue-loading">Loading revenue data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revenue-container">
        <div className="revenue-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="revenue-main-container">
      <h1 className="revenue-page-title">Financial Dashboard</h1>

      {/* STATS CARDS */}
      <div className="revenue-stats-container">
        <div className="revenue-stat-card revenue-stat-highlight">
          <h3>Total Revenue (Completed)</h3>
          <div className="revenue-stat-value">
            {formatCurrency(metrics?.totalRevenue || 0)}
          </div>
        </div>
        <div className="revenue-stat-card">
          <h3>Ongoing Project Value</h3>
          <div className="revenue-stat-value">
            {formatCurrency(metrics?.ongoingProjectValue || 0)}
          </div>
        </div>
        <div className="revenue-stat-card">
          <h3>Completed Projects</h3>
          <div className="revenue-stat-value">{metrics?.completedProjects || 0}</div>
        </div>
        <div className="revenue-stat-card">
          <h3>Average Project Value</h3>
          <div className="revenue-stat-value">
            {formatCurrency(metrics?.averageProjectValue || 0)}
          </div>
        </div>
      </div>

      {/* CONTENT WRAPPER */}
      <div className="revenue-content-wrapper">
        {/* MAIN SECTION */}
        <div className="revenue-main-section">
          <h2>All Projects</h2>
          <div className="revenue-project-list-container">
            {projects && projects.length > 0 ? (
              <table className="revenue-project-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Client</th>
                    <th>Completed On</th>
                    <th>Status</th>
                    <th>Final Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id}>
                      <td>{project.projectName}</td>
                      <td>{project.customerName}</td>
                      <td>
                        {project.status === "completed"
                          ? formatDate(project.updatedAt)
                          : "Ongoing"}
                      </td>
                      <td>
                        <span
                          className={`revenue-status-badge revenue-status-${project.status}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td>
                        {formatCurrency(
                          project.paymentDetails?.totalAmount || 0
                        )}
                      </td>
                      <td>
                        <button
                          className="revenue-btn revenue-btn-secondary"
                          onClick={() => handleViewDetails(project)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="revenue-no-projects">No projects found.</div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="revenue-sidebar">
          <div className="revenue-stat-card">
            <h3>Revenue (This Month)</h3>
            <div className="revenue-stat-value">
              {formatCurrency(metrics?.revenueThisMonth || 0)}
            </div>
          </div>
          <div className="revenue-stat-card">
            <h3>Revenue (This Quarter)</h3>
            <div className="revenue-stat-value">
              {formatCurrency(metrics?.revenueThisQuarter || 0)}
            </div>
          </div>
          <div className="revenue-stat-card">
            <h3>Annual Revenue (YTD)</h3>
            <div className="revenue-stat-value">
              {formatCurrency(metrics?.revenueThisYear || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && selectedProject && (
        <div className="revenue-modal" onClick={handleCloseModal}>
          <div className="revenue-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="revenue-close-modal" onClick={handleCloseModal}>
              &times;
            </span>
            <h2 className="revenue-modal-project-name">
              {selectedProject.projectName}
            </h2>
            <div className="revenue-modal-project-details">
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Client</div>
                <div className="revenue-detail-value">
                  {selectedProject.customerName || "N/A"}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Location</div>
                <div className="revenue-detail-value">
                  {selectedProject.projectAddress || "N/A"}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Total Cost</div>
                <div className="revenue-detail-value">
                  {formatCurrency(
                    selectedProject.paymentDetails?.totalAmount || 0
                  )}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Amount Received</div>
                <div className="revenue-detail-value">
                  {formatCurrency(
                    selectedProject.paymentDetails?.amountPaidToCompany || 0
                  )}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Pending Amount</div>
                <div className="revenue-detail-value">
                  {formatCurrency(
                    (selectedProject.paymentDetails?.totalAmount || 0) -
                      (selectedProject.paymentDetails?.amountPaidToCompany || 0)
                  )}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Start Date</div>
                <div className="revenue-detail-value">
                  {formatDate(selectedProject.createdAt)}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">
                  {selectedProject.status === "completed"
                    ? "End Date"
                    : "Est. End Date"}
                </div>
                <div className="revenue-detail-value">
                  {calculateEndDate(selectedProject)}
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Completion</div>
                <div className="revenue-detail-value">
                  <div>{selectedProject.completionPercentage || 0}%</div>
                  <div className="revenue-progress-container">
                    <div
                      className="revenue-progress-fill"
                      style={{
                        width: `${selectedProject.completionPercentage || 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="revenue-detail-row">
                <div className="revenue-detail-label">Description</div>
                <div className="revenue-detail-value">
                  {selectedProject.specialRequirements ||
                    selectedProject.proposal?.description ||
                    "No description available."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRevenue;