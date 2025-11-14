import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // We'll define this CSS below

const Dashboard = () => {
  const [data, setData] = useState({
    workerName: '',
    stats: { pendingOffers: 0, activeApplications: 0 },
    user: { availability: 'available' },
    offers: [],
    companies: [],
    jobs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dashboard JSON from explicit API endpoint to avoid legacy HTML route collisions
    fetch('/api/worker/dashboard', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        return res.json();
      })
      .then((fetchedData) => {
        setData(fetchedData);
        // Update localStorage with fresh user data including profileImage
        if (fetchedData.user) {
          const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...existingUser, ...fetchedData.user }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  const { workerName, stats, user, offers, companies, jobs } = data;

  return (
    <main className="wkd-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {workerName}</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Pending Offers</h3>
            <div className="stat-value">{stats.pendingOffers}</div>
          </div>
          <div className="stat-card">
            <h3>Active Applications</h3>
            <div className="stat-value">{stats.activeApplications}</div>
          </div>
          <div className="stat-card">
            <h3>Availability</h3>
            <div
              className="stat-value"
              style={{ fontSize: '1.75rem', textTransform: 'capitalize' }}
            >
              {user.availability}
            </div>
          </div>
        </div>

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
      </div>
    </main>
  );
};

export default Dashboard;