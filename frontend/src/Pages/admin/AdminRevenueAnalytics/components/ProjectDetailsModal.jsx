import React from "react";

const ProjectDetailsModal = ({ project, onClose }) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getPaymentStatusBadge = (status) => {
    if (status === "released" || status === "paid") return "ara-payment-paid";
    return "ara-payment-pending";
  };

  const getPaymentStatusText = (status) => {
    if (status === "released" || status === "paid") return "Paid";
    return "Pending";
  };

  return (
    <div className="ara-modal-overlay" onClick={onClose}>
      <div className="ara-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ara-modal-header">
          <h2 className="ara-modal-title">{project.projectName}</h2>
          <button className="ara-modal-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="ara-modal-body">
          {/* Project Summary */}
          <div className="ara-modal-summary">
            <div className="ara-summary-card">
              <div className="ara-summary-label">Total Amount</div>
              <div className="ara-summary-value ara-summary-total">
                {formatCurrency(project.totalAmount)}
              </div>
            </div>
            <div className="ara-summary-card">
              <div className="ara-summary-label">Amount Received</div>
              <div className="ara-summary-value ara-summary-received">
                {formatCurrency(project.receivedAmount)}
              </div>
            </div>
            <div className="ara-summary-card">
              <div className="ara-summary-label">Pending Amount</div>
              <div className="ara-summary-value ara-summary-pending">
                {formatCurrency(project.pendingAmount)}
              </div>
            </div>
          </div>

          {/* Project Info Grid */}
          <div className="ara-modal-info-section">
            <h3 className="ara-modal-section-title">Project Information</h3>
            <div className="ara-modal-info-grid">
              <div className="ara-info-item">
                <span className="ara-info-label">Status</span>
                <span className="ara-info-value">{project.status}</span>
              </div>
              <div className="ara-info-item">
                <span className="ara-info-label">Progress</span>
                <span className="ara-info-value">{project.completionPercentage}%</span>
              </div>
              <div className="ara-info-item">
                <span className="ara-info-label">Company</span>
                <span className="ara-info-value">{project.company.name}</span>
              </div>
              <div className="ara-info-item">
                <span className="ara-info-label">Contact Person</span>
                <span className="ara-info-value">{project.company.contactPerson || "N/A"}</span>
              </div>
              <div className="ara-info-item">
                <span className="ara-info-label">Customer</span>
                <span className="ara-info-value">{project.customer.name}</span>
              </div>
              <div className="ara-info-item">
                <span className="ara-info-label">Customer Phone</span>
                <span className="ara-info-value">{project.customer.phone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Phase Breakdown */}
          <div className="ara-modal-phases-section">
            <h3 className="ara-modal-section-title">Phase-wise Payment Breakdown</h3>
            <div className="ara-phases-list">
              {project.phaseBreakdown.map((phase) => (
                <div key={phase.phase} className="ara-phase-detail">
                  <div className="ara-phase-detail-header">
                    <h4 className="ara-phase-detail-name">
                      {phase.isFinal ? "Final Phase (100%)" : `Phase ${phase.phase} (${phase.phase * 25}%)`}
                    </h4>
                    <div className="ara-phase-detail-total">
                      {formatCurrency(phase.totalAmount)}
                    </div>
                  </div>

                  {!phase.isFinal && (
                    <div className="ara-phase-payments">
                      <div className="ara-payment-item">
                        <div className="ara-payment-info">
                          <span className="ara-payment-label">Upfront Payment (40%)</span>
                          <span className="ara-payment-amount">{formatCurrency(phase.upfront.amount)}</span>
                        </div>
                        <div className="ara-payment-status">
                          <span className={`ara-payment-badge ${getPaymentStatusBadge(phase.upfront.status)}`}>
                            {getPaymentStatusText(phase.upfront.status)}
                          </span>
                          {phase.upfront.received > 0 && (
                            <span className="ara-payment-received">
                              {formatCurrency(phase.upfront.received)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ara-payment-item">
                        <div className="ara-payment-info">
                          <span className="ara-payment-label">Completion Payment (60%)</span>
                          <span className="ara-payment-amount">{formatCurrency(phase.completion.amount)}</span>
                        </div>
                        <div className="ara-payment-status">
                          <span className={`ara-payment-badge ${getPaymentStatusBadge(phase.completion.status)}`}>
                            {getPaymentStatusText(phase.completion.status)}
                          </span>
                          {phase.completion.received > 0 && (
                            <span className="ara-payment-received">
                              {formatCurrency(phase.completion.received)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {phase.isFinal && (
                    <div className="ara-phase-payments">
                      <div className="ara-payment-item">
                        <div className="ara-payment-info">
                          <span className="ara-payment-label">Final Payment (10% of total)</span>
                          <span className="ara-payment-amount">{formatCurrency(phase.final.amount)}</span>
                        </div>
                        <div className="ara-payment-status">
                          <span className={`ara-payment-badge ${getPaymentStatusBadge(phase.final.status)}`}>
                            {getPaymentStatusText(phase.final.status)}
                          </span>
                          {phase.final.received > 0 && (
                            <span className="ara-payment-received">
                              {formatCurrency(phase.final.received)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="ara-phase-summary">
                    <div className="ara-phase-summary-item">
                      <span>Received:</span>
                      <strong className="ara-text-success">{formatCurrency(phase.totalReceived)}</strong>
                    </div>
                    <div className="ara-phase-summary-item">
                      <span>Pending:</span>
                      <strong className="ara-text-warning">{formatCurrency(phase.totalPending)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ara-modal-footer">
          <button className="ara-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
