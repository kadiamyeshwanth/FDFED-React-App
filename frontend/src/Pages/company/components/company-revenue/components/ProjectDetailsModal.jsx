// src/pages/company/components/company-revenue/components/ProjectDetailsModal.jsx
import React from 'react';

const ProjectDetailsModal = ({ 
  isOpen, 
  project, 
  onClose, 
  formatCurrency, 
  formatDate,
  calculateEndDate 
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="revenue-modal" onClick={onClose}>
      <div className="revenue-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="revenue-close-modal" onClick={onClose}>
          &times;
        </span>
        <h2 className="revenue-modal-project-name">
          {project.projectName}
        </h2>
        <div className="revenue-modal-project-details">
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Client</div>
            <div className="revenue-detail-value">
              {project.customerName || "N/A"}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Location</div>
            <div className="revenue-detail-value">
              {project.projectAddress || "N/A"}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Total Cost</div>
            <div className="revenue-detail-value">
              {formatCurrency(
                project.paymentDetails?.totalAmount || 0
              )}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Amount Received</div>
            <div className="revenue-detail-value">
              {formatCurrency(
                project.paymentDetails?.amountPaidToCompany || 0
              )}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Pending Amount</div>
            <div className="revenue-detail-value">
              {formatCurrency(
                (project.paymentDetails?.totalAmount || 0) -
                  (project.paymentDetails?.amountPaidToCompany || 0)
              )}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Start Date</div>
            <div className="revenue-detail-value">
              {formatDate(project.createdAt)}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">
              {project.status === "completed"
                ? "End Date"
                : "Est. End Date"}
            </div>
            <div className="revenue-detail-value">
              {calculateEndDate(project)}
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Completion</div>
            <div className="revenue-detail-value">
              <div>{project.completionPercentage || 0}%</div>
              <div className="revenue-progress-container">
                <div
                  className="revenue-progress-fill"
                  style={{
                    width: `${project.completionPercentage || 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="revenue-detail-row">
            <div className="revenue-detail-label">Description</div>
            <div className="revenue-detail-value">
              {project.specialRequirements ||
                project.proposal?.description ||
                "No description available."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
