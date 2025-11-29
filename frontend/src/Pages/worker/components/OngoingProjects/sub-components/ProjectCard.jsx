import React from 'react';
import UpdateForm from './UpdateForm';
import './ProjectCard.css';

// For Accepted Projects - with update form
export const AcceptedProjectCard = ({ 
  project, 
  updateText,
  onViewDetails, 
  onUpdateChange, 
  onUpdateSubmit,
  onMarkComplete 
}) => {
  return (
    <div className="wkop-project-card">
      <div className="wkop-project-header">
        <h3>{project.projectName}</h3>
        <button 
          className="wkop-btn wkop-btn-outline"
          onClick={() => onViewDetails(project)}
        >
          View Details
        </button>
      </div>
      <div className="wkop-project-body">
        <h4 className="wkop-section-title">Post a New Update</h4>
        <UpdateForm
          projectId={project._id}
          projectType={project.projectType}
          updateText={updateText}
          onTextChange={onUpdateChange}
          onImageChange={onUpdateChange}
          onSubmit={onUpdateSubmit}
        />
      </div>
      <div className="wkop-project-footer">
        <button 
          className="wkop-btn wkop-btn-complete"
          onClick={() => onMarkComplete(project._id, project.projectType)}
        >
          <i className="fas fa-check-circle"></i> Mark as Completed
        </button>
      </div>
    </div>
  );
};

// For Completed/Rejected Projects - simple view only
export const SimpleProjectCard = ({ project, onViewDetails }) => {
  return (
    <div className="wkop-project-card">
      <div className="wkop-project-header">
        <h3>{project.projectName}</h3>
        <button 
          className="wkop-btn wkop-btn-outline"
          onClick={() => onViewDetails(project)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};
