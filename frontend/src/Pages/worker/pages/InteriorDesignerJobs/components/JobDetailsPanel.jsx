import React from 'react';

const JobDetailsPanel = ({ selectedJob, onCreateProposal, onDenyJob, hasJobs }) => {
  if (!selectedJob) {
    return (
      <section className="job-details-panel">
        <div className="empty-state">
          <i className="fas fa-clipboard-list empty-icon"></i>
          <h2>No Job Selected</h2>
          <p>
            {hasJobs
              ? 'Click on a job offer from the list to view its details'
              : 'No interior designer jobs available'}
          </p>
        </div>
      </section>
    );
  }

  const createdDate = selectedJob.createdAt
    ? new Date(selectedJob.createdAt).toLocaleDateString()
    : 'N/A';

  const roomSize = selectedJob.roomSize
    ? `${selectedJob.roomSize.length} × ${selectedJob.roomSize.width} ${selectedJob.roomSize.unit || 'ft'}`
    : 'N/A';

  const ceilingHeight = selectedJob.ceilingHeight
    ? `${selectedJob.ceilingHeight.height} ${selectedJob.ceilingHeight.unit || 'ft'}`
    : 'N/A';

  const isActionable = selectedJob.status === 'pending' || selectedJob.status === 'proposal_sent';

  return (
    <section className="job-details-panel">
      <div className="job-details-content active">
        {/* Details Header */}
        <div className="details-header">
          <div className="details-header-left">
            <h2>{selectedJob.projectName || 'Untitled Project'}</h2>
            <span className="job-type interior">
              {selectedJob.roomType || 'Interior'}
            </span>
            <p className="job-budget">
              ₹{selectedJob.budget ? selectedJob.budget.toLocaleString('en-IN') : 'Budget not specified'}
            </p>
          </div>
          <div className="details-header-right">
            <p className="detail-label">Posted On</p>
            <p className="detail-value">{createdDate}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="details-section">
          <h3>
            <i className="fas fa-user"></i> Customer Details
          </h3>
          <div className="details-grid">
            <div className="detail-item">
              <p className="detail-label">Name</p>
              <p className="detail-value">
                {selectedJob.customerId?.name || selectedJob.fullName || 'Anonymous'}
              </p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Contact</p>
              <p className="detail-value">
                {selectedJob.customerId?.phone || selectedJob.phone || 'N/A'}
              </p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Email</p>
              <p className="detail-value">
                {selectedJob.customerId?.email || selectedJob.email || 'N/A'}
              </p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Address</p>
              <p className="detail-value">{selectedJob.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Room Information */}
        <div className="details-section">
          <h3>
            <i className="fas fa-home"></i> Room Information
          </h3>
          <div className="details-grid">
            <div className="detail-item">
              <p className="detail-label">Room Type</p>
              <p className="detail-value">{selectedJob.roomType || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Size</p>
              <p className="detail-value">{roomSize}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Ceiling Height</p>
              <p className="detail-value">{ceilingHeight}</p>
            </div>
            <div className="detail-item">
              <p className="detail-label">Preferred Style</p>
              <p className="detail-value">{selectedJob.designPreference || 'N/A'}</p>
            </div>
          </div>

          {selectedJob.projectDescription && (
            <div className="special-features">
              <p className="detail-label">Special Features</p>
              <p className="detail-value">{selectedJob.projectDescription}</p>
            </div>
          )}
        </div>

        {/* Inspiration Images */}
        {selectedJob.inspirationImages && selectedJob.inspirationImages.length > 0 && (
          <div className="details-section">
            <h3>
              <i className="fas fa-images"></i> Inspiration Images
            </h3>
            <div className="reference-images">
              {selectedJob.inspirationImages.map((image, index) => (
                <div
                  key={index}
                  className="reference-image"
                  style={{ backgroundImage: `url('${image}')` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedJob.status !== 'accepted' && selectedJob.status !== 'rejected' && (
          <div className="job-action-buttons">
            {selectedJob.status === 'pending' && (
              <>
                <button
                  className="job-action-button accept-button"
                  onClick={() => onCreateProposal(selectedJob._id)}
                >
                  <i className="fas fa-file-signature"></i> Create Proposal
                </button>
                <button
                  className="job-action-button deny-button"
                  onClick={() => onDenyJob(selectedJob._id)}
                >
                  <i className="fas fa-times"></i> Deny Job
                </button>
              </>
            )}
            {selectedJob.status === 'proposal_sent' && (
              <button
                className="job-action-button"
                disabled
                style={{ backgroundColor: '#7f8c8d', cursor: 'not-allowed' }}
              >
                <i className="fas fa-check"></i> Proposal Submitted
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobDetailsPanel;
