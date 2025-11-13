import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompaniesSection = ({ companies }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/worker/join-company');
  };

  const handleApply = () => {
    navigate('/worker/join-company');
  };

  return (
    <section className="card-section">
      <div className="section-header">
        <h2 className="section-title">Companies You Can Join</h2>
        <button className="view-all-link" onClick={handleViewAll}>
          View All
        </button>
      </div>
      <div className="cards-container">
        {companies && companies.length > 0 ? (
          companies.map((company, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <h3 className="card-company">{company.companyName}</h3>
                <p className="card-location">
                  <i className="fas fa-map-marker-alt"></i>{' '}
                  {company.location?.city || company.city || 'Not specified'}
                </p>
              </div>
              <div className="card-body">
                <p className="card-description">{company.aboutCompany || 'No description available'}</p>
                <div className="card-details">
                  <div className="card-detail">
                    <span className="detail-label">Industry</span>
                    <span className="detail-value">
                      {company.specialization?.join(', ') || 'General'}
                    </span>
                  </div>
                  <div className="card-detail">
                    <span className="detail-label">Size</span>
                    <span className="detail-value">{company.size || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-primary" onClick={handleApply}>
                  Apply Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <h4>No Companies Available</h4>
            <p>Check back soon for new companies joining the platform!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompaniesSection;
