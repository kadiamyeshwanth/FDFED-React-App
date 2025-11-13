import React from 'react';
import { useNavigate } from 'react-router-dom';

const JobsSection = ({ jobs }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/worker/jobs');
  };

  const handleViewDetails = () => {
    navigate('/worker/jobs');
  };

  return (
    <section className="card-section">
      <div className="section-header">
        <h2 className="section-title">New Jobs</h2>
        <button className="view-all-link" onClick={handleViewAll}>
          View All
        </button>
      </div>
      <div className="cards-container">
        {jobs && jobs.length > 0 ? (
          jobs.map((job, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <h3 className="card-company">{job.projectName}</h3>
                <p className="card-location">
                  <i className="fas fa-map-marker-alt"></i> {job.address || 'Not specified'}
                </p>
              </div>
              <div className="card-body">
                <p className="card-description">{job.projectDescription || 'No description provided'}</p>
                <div className="card-details">
                  <div className="card-detail">
                    <span className="detail-label">Timeline</span>
                    <span className="detail-value">{job.timeline || 'Not specified'}</span>
                  </div>
                  <div className="card-detail">
                    <span className="detail-label">Budget</span>
                    <span className="detail-value">
                      ₹{job.budget ? job.budget.toLocaleString('en-IN') : 'TBD'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-primary" onClick={handleViewDetails}>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <h4>No New Jobs</h4>
            <p>New job opportunities from customers will be displayed here as they are posted.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobsSection;
