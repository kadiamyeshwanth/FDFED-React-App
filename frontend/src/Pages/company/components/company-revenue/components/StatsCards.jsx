// src/pages/company/components/company-revenue/components/StatsCards.jsx
import React from 'react';

const StatsCards = ({ metrics, formatCurrency }) => {
  return (
    <div className="revenue-stats-container">
      <div className="revenue-stat-card revenue-stat-highlight">
        <h3>Total Revenue (Completed)</h3>
        <div className="revenue-stat-value">
          {formatCurrency(metrics?.totalRevenue || 0)}
        </div>
      </div>
      <div className="revenue-stat-card">
        <h3>Ongoing Project Value</h3>
        <div className="revenue-stat-value">
          {formatCurrency(metrics?.ongoingProjectValue || 0)}
        </div>
      </div>
      <div className="revenue-stat-card">
        <h3>Completed Projects</h3>
        <div className="revenue-stat-value">{metrics?.completedProjects || 0}</div>
      </div>
      <div className="revenue-stat-card">
        <h3>Average Project Value</h3>
        <div className="revenue-stat-value">
          {formatCurrency(metrics?.averageProjectValue || 0)}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
