// src/pages/company/components/company-revenue/components/ProjectsTable.jsx
import React from 'react';

const ProjectsTable = ({ projects, formatCurrency, formatDate, onViewDetails }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="revenue-project-list-container">
        <div className="revenue-no-projects">No projects found.</div>
      </div>
    );
  }

  return (
    <div className="revenue-project-list-container">
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
                  onClick={() => onViewDetails(project)}
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsTable;
