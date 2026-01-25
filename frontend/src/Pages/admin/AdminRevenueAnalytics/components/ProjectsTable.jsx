import React from "react";

const ProjectsTable = ({ projects, onViewDetails }) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "completed") return "ara-status-completed";
    if (statusLower === "accepted" || statusLower === "ongoing") return "ara-status-ongoing";
    return "ara-status-pending";
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="ara-empty-projects">
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <div className="ara-table-container">
      <table className="ara-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Company</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Total Amount</th>
            <th>Received</th>
            <th>Pending</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const collectionRate = project.totalAmount > 0 
              ? ((project.receivedAmount / project.totalAmount) * 100).toFixed(1) 
              : 0;

            return (
              <tr key={project._id}>
                <td>
                  <div className="ara-project-name">
                    <strong>{project.projectName}</strong>
                  </div>
                </td>
                <td>
                  <div className="ara-company-info">
                    <div className="ara-company-name">{project.company.name}</div>
                    {project.company.contactPerson && (
                      <div className="ara-company-contact">{project.company.contactPerson}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="ara-customer-info">
                    <div className="ara-customer-name">{project.customer.name}</div>
                    {project.customer.phone && (
                      <div className="ara-customer-phone">{project.customer.phone}</div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`ara-status-badge ${getStatusBadge(project.status)}`}>
                    {project.status || "Unknown"}
                  </span>
                </td>
                <td>
                  <div className="ara-progress-cell">
                    <div className="ara-progress-bar-small">
                      <div
                        className="ara-progress-fill-small"
                        style={{ width: `${project.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ara-progress-text-small">{project.completionPercentage}%</span>
                  </div>
                </td>
                <td>
                  <div className="ara-amount ara-amount-total">{formatCurrency(project.totalAmount)}</div>
                </td>
                <td>
                  <div className="ara-amount ara-amount-received">
                    {formatCurrency(project.receivedAmount)}
                    <div className="ara-mini-progress">
                      <div
                        className="ara-mini-progress-fill ara-mini-success"
                        style={{ width: `${collectionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="ara-amount ara-amount-pending">
                    {formatCurrency(project.pendingAmount)}
                  </div>
                </td>
                <td>
                  <button
                    className="ara-btn-view"
                    onClick={() => onViewDetails(project)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
