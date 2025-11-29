import React from 'react';

const StatsGrid = ({ stats, availability }) => {
  return (
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
          {availability}
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
