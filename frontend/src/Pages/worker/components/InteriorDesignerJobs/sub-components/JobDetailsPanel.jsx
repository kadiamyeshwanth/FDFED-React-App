import React from 'react';

const JobDetailsPanel = ({ selectedJob, onAccept, onReject, formatDate }) => {
  if (!selectedJob) {
    return (
      <section className="wkidj-job-details-panel">
        <div className="wkidj-empty-state">
          <i className="fas fa-clipboard-list wkidj-empty-icon"></i>
          <h2>No Job Selected</h2>
          <p>Click on a job offer from the list to view its details</p>
        </div>
      </section>
    );
  }

  return (
    <section className="wkidj-job-details-panel">
      <div className="wkidj-job-details-content">
        <div className="wkidj-details-header">
          <div className="wkidj-details-header-left">
            <h2>{selectedJob.projectName || 'Untitled Project'}</h2>
            <span className="wkidj-job-type wkidj-interior">
              {selectedJob.roomType || 'Interior'}
            </span>
            <p className="wkidj-job-budget">{selectedJob.budget || 'Budget not specified'}</p>
          </div>
          <div className="wkidj-details-header-right">
            <p className="wkidj-detail-label">Posted On</p>
            <p className="wkidj-detail-value">
              {selectedJob.createdAt 
                ? formatDate(selectedJob.createdAt)
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="wkidj-details-section">
          <h3><i className="fas fa-user"></i> Customer Details</h3>
          <div className="wkidj-details-grid">
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Name</p>
              <p className="wkidj-detail-value">
                {selectedJob.customerId?.name || selectedJob.fullName || 'Anonymous'}
              </p>
            </div>
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Contact</p>
              <p className="wkidj-detail-value">
                {selectedJob.customerId?.phone || selectedJob.phone || 'N/A'}
              </p>
            </div>
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Email</p>
              <p className="wkidj-detail-value">
                {selectedJob.customerId?.email || selectedJob.email || 'N/A'}
              </p>
            </div>
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Address</p>
              <p className="wkidj-detail-value">{selectedJob.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="wkidj-details-section">
          <h3><i className="fas fa-home"></i> Room Information</h3>
          <div className="wkidj-details-grid">
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Room Type</p>
              <p className="wkidj-detail-value">{selectedJob.roomType || 'N/A'}</p>
            </div>
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Size</p>
              <p className="wkidj-detail-value">
                {selectedJob.roomSize 
                  ? `${selectedJob.roomSize.length} × ${selectedJob.roomSize.width} ${selectedJob.roomSize.unit}` 
                  : 'N/A'}
              </p>
            </div>
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Ceiling Height</p>
              <p className="wkidj-detail-value">
                {selectedJob.ceilingHeight 
                  ? `${selectedJob.ceilingHeight.height} ${selectedJob.ceilingHeight.unit}` 
                  : 'N/A'}
              </p>
            </div>
            <div className="wkidj-detail-item">
              <p className="wkidj-detail-label">Preferred Style</p>
              <p className="wkidj-detail-value">{selectedJob.designPreference || 'N/A'}</p>
            </div>
          </div>
          {selectedJob.projectDescription && (
            <div className="wkidj-special-features">
              <p className="wkidj-detail-label">Special Features</p>
              <p className="wkidj-detail-value">{selectedJob.projectDescription}</p>
            </div>
          )}
        </div>

        {selectedJob.inspirationImages && selectedJob.inspirationImages.length > 0 && (
          <div className="wkidj-details-section">
            <h3><i className="fas fa-images"></i> Inspiration Images</h3>
            <div className="wkidj-reference-images">
              {selectedJob.inspirationImages.map((image, index) => (
                <div 
                  key={index}
                  className="wkidj-reference-image" 
                  style={{ backgroundImage: `url('${image}')` }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {selectedJob.status !== 'accepted' && selectedJob.status !== 'rejected' && (
          <div className="wkidj-job-action-buttons">
            <button 
              className="wkidj-job-action-button wkidj-accept-button" 
              onClick={onAccept}
            >
              <i className="fas fa-check"></i> Accept Job
            </button>
            <button 
              className="wkidj-job-action-button wkidj-deny-button" 
              onClick={onReject}
            >
              <i className="fas fa-times"></i> Deny Job
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobDetailsPanel;
