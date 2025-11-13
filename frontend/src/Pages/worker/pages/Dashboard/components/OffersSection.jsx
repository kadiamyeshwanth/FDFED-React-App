import React from 'react';
import { useNavigate } from 'react-router-dom';

const OffersSection = ({ offers }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/worker/join-company');
  };

  const handleViewOffer = () => {
    navigate('/worker/join-company');
  };

  return (
    <section className="card-section">
      <div className="section-header">
        <h2 className="section-title">Recent Offers</h2>
        <button className="view-all-link" onClick={handleViewAll}>
          View All
        </button>
      </div>
      <div className="cards-container">
        {offers && offers.length > 0 ? (
          offers.map((offer, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <h3 className="card-company">
                  {offer.company?.companyName || offer.companyName || 'Company'}
                </h3>
                <p className="card-location">
                  <i className="fas fa-map-marker-alt"></i> {offer.location || 'Not specified'}
                </p>
              </div>
              <div className="card-body">
                <p className="card-description">
                  Exciting new opportunity! This company has extended an offer for the following position.
                </p>
                <div className="card-details">
                  <div className="card-detail">
                    <span className="detail-label">Position</span>
                    <span className="detail-value">{offer.position || 'Not specified'}</span>
                  </div>
                  <div className="card-detail">
                    <span className="detail-label">Salary</span>
                    <span className="detail-value">
                      ₹{offer.salary ? offer.salary.toLocaleString('en-IN') : 'TBD'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="btn btn-primary" onClick={handleViewOffer}>
                  View Offer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <h4>No Offers Yet</h4>
            <p>
              When a company sends you a job offer, it will appear here. Keep your profile updated to attract
              opportunities!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default OffersSection;
