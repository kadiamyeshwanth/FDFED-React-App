// src/pages/company/components/company-project-requests/components/ProposalModal.jsx
import React from 'react';

const ProposalModal = ({ 
  isOpen, 
  onClose, 
  project,
  proposalData,
  proposalErrors,
  maxBudget,
  onProposalChange,
  onSubmitProposal
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="requests-proposal-modal requests-proposal-modal-active" onClick={onClose}>
      <div
        className="requests-proposal-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="requests-proposal-modal-header">
          <h3>Create Proposal</h3>
          <button className="requests-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="requests-proposal-modal-body">
          <form onSubmit={onSubmitProposal}>
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
                onChange={onProposalChange}
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
                onChange={onProposalChange}
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
  );
};

export default ProposalModal;
