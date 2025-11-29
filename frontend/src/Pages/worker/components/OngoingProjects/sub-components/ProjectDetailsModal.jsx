import React from 'react';
import './ProjectDetailsModal.css';

const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;

  const isArchitect = project.projectType === 'architect';

  return (
    <div className="wkop-modal" onClick={onClose}>
      <div className="wkop-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="wkop-close-modal" onClick={onClose}>×</span>
        
        <div className="wkop-modal-header">
          <h2>{isArchitect ? project.projectName : project.roomType}</h2>
        </div>

        <div className="wkop-modal-body">
          {isArchitect ? (
            <>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Project Overview</div>
                <p>{project.projectDescription}</p>
              </div>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Customer Details</div>
                <div className="wkop-detail-grid">
                  <div className="wkop-modal-detail-item">
                    <strong>Name:</strong> {project.customerDetails?.name}
                  </div>
                  <div className="wkop-modal-detail-item">
                    <strong>Contact:</strong> {project.customerDetails?.contactNumber}
                  </div>
                </div>
              </div>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Plot Information</div>
                <div className="wkop-detail-grid">
                  <div className="wkop-modal-detail-item">
                    <strong>Location:</strong> {project.plotInformation?.plotLocation}
                  </div>
                  <div className="wkop-modal-detail-item">
                    <strong>Size:</strong> {project.plotInformation?.plotSize}
                  </div>
                </div>
              </div>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Special Features</div>
                <p>{project.designRequirements?.specialFeatures || 'None'}</p>
              </div>
            </>
          ) : (
            <>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Customer Details</div>
                <div className="wkop-detail-grid">
                  <div className="wkop-modal-detail-item">
                    <strong>Name:</strong> {project.fullName}
                  </div>
                  <div className="wkop-modal-detail-item">
                    <strong>Contact:</strong> {project.phone}
                  </div>
                  <div className="wkop-modal-detail-item">
                    <strong>Email:</strong> {project.email}
                  </div>
                  <div className="wkop-modal-detail-item">
                    <strong>Address:</strong> {project.address}
                  </div>
                </div>
              </div>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Room Information</div>
                <div className="wkop-detail-grid">
                  <div className="wkop-modal-detail-item">
                    <strong>Room Type:</strong> {project.roomType}
                  </div>
                  <div className="wkop-modal-detail-item">
                    <strong>Size:</strong> {project.roomSize?.length}x{project.roomSize?.width} {project.roomSize?.unit}
                  </div>
                </div>
              </div>
              <div className="wkop-modal-section">
                <div className="wkop-modal-section-title">Special Features</div>
                <p>{project.projectDescription || 'None'}</p>
              </div>
            </>
          )}

          {/* Inspiration Images */}
          {(() => {
            const images = isArchitect 
              ? project.additionalDetails?.referenceImages 
              : project.inspirationImages;
            
            if (images && images.length > 0) {
              return (
                <div className="wkop-modal-section">
                  <div className="wkop-modal-section-title">Inspiration Images</div>
                  <div className="wkop-inspiration-images">
                    {images.map((img, index) => {
                      const imgUrl = typeof img === 'string' ? img : img.url;
                      return (
                        <div key={index}>
                          <img src={imgUrl} alt={`Inspiration ${index + 1}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Update History */}
          <div className="wkop-modal-section">
            <div className="wkop-modal-section-title">Update History</div>
            <div className="wkop-update-history">
              {project.projectUpdates && project.projectUpdates.length > 0 ? (
                project.projectUpdates.map((update, index) => (
                  <div key={index} className="wkop-update-item">
                    <p>{update.updateText}</p>
                    <small>{new Date(update.createdAt).toLocaleString()}</small>
                  </div>
                ))
              ) : (
                <p>No updates for this project.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
