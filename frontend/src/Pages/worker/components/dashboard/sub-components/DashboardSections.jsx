import React from 'react';
import { Link } from 'react-router-dom';

export const OffersSection = ({ offers }) => {
  return (
    <section className="card-section">
      <div className="section-header">
        <h2 className="section-title">Recent Offers</h2>
        <Link to="/workerjoin_company" className="view-all-link">
          View All
        </Link>
      </div>
      <div className="cards-container">
        {offers && offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer._id} className="card">
              <div className="card-header">
                <h3 className="card-company">{offer.company?.companyName}</h3>
                <p className="card-location">
                  <i className="fas fa-map-marker-alt"></i> {offer.location || 'Not specified'}
                </p>
              </div>
              <div className="card-body">
                <p className="card-description">
                  Exciting new opportunity! This company has extended an offer for the following
                  position.
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
                <Link to="/workerjoin_company" className="btn btn-primary">
                  View Offer
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <h4>No Offers Yet</h4>
            <p>
              When a company sends you a job offer, it will appear here. Keep your profile
              updated to attract opportunities!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export const CompaniesSection = ({ companies }) => {
  return (
    <section className="card-section">
      <div className="section-header">
        <h2 className="section-title">Companies You Can Join</h2>
        <Link to="/workerjoin_company" className="view-all-link">
          View All
        </Link>
      </div>
      <div className="cards-container">
        {companies && companies.length > 0 ? (
          companies.map((company) => (
            <div key={company._id} className="card">
              <div className="card-header">
                <h3 className="card-company">{company.companyName}</h3>
                <p className="card-location">
                  <i className="fas fa-map-marker-alt"></i> {company.location?.city || 'Not specified'}
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
                <Link to="/workerjoin_company" className="btn btn-primary">
                  Apply Now
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No companies available.</p>
        )}
      </div>
    </section>
  );
};

export const JobsSection = ({ jobs }) => {
  return (
    <section className="card-section">
      <div className="section-header">
        <h2 className="section-title">New Jobs</h2>
        <Link to="/workerjobs" className="view-all-link">
          View All
        </Link>
      </div>
      <div className="cards-container">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className="card">
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
                <Link to="/workerjobs" className="btn btn-primary">
                  View Details
                </Link>
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
