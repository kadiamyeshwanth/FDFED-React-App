import React from 'react';

const ProjectsSection = ({ projects }) => {
  return (
    <div className="projects-section">
      <h2 className="section-title">Ongoing Projects</h2>
      <div className="project-grid">
        {projects && projects.length > 0 ? (
          projects.map((project, index) => (
            <div key={index} className="project-card">
              <h3>{project.projectName}</h3>
              <p className="status">
                <strong>Status:</strong> <span className={`status-badge status-${project.status?.toLowerCase()}`}>{project.status}</span>
              </p>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              {project.timeline && (
                <p className="project-timeline">
                  <i className="fas fa-calendar"></i> {project.timeline}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="no-projects-message">
            <p>This company has no ongoing projects.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;
