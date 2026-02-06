import React from "react";

const StatsCards = ({ metrics, phaseAnalytics }) => {
  const formatCurrency = (amount) => {
    const value = amount || 0;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatPercentage = (value) => {
    const percentage = value || 0;
    return `${percentage.toFixed(2)}%`;
  };

  const safeMetrics = {
    totalRevenue: metrics?.totalRevenue || 0,
    receivedRevenue: metrics?.receivedRevenue || 0,
    pendingRevenue: metrics?.pendingRevenue || 0,
    collectionRate: metrics?.collectionRate || 0,
    activeProjects: metrics?.activeProjects || 0,
    completedProjects: metrics?.completedProjects || 0,
    totalProjects: metrics?.totalProjects || 0,
  };

  return (
    <div className="ara-stats-section">
      {/* Main Stats Cards */}
      <div className="ara-stats-grid">
        <div className="ara-stat-card ara-stat-total">
          <div className="ara-stat-icon">💰</div>
          <div className="ara-stat-content">
            <h3 className="ara-stat-label">Total Platform Revenue</h3>
            <p className="ara-stat-value">{formatCurrency(safeMetrics.totalRevenue)}</p>
            <div className="ara-stat-meta">
              <span className="ara-stat-badge">{safeMetrics.totalProjects} Projects</span>
            </div>
          </div>
        </div>

        <div className="ara-stat-card ara-stat-received">
          <div className="ara-stat-icon">✅</div>
          <div className="ara-stat-content">
            <h3 className="ara-stat-label">Total Received</h3>
            <p className="ara-stat-value">{formatCurrency(safeMetrics.receivedRevenue)}</p>
            <div className="ara-stat-progress">
              <div className="ara-progress-bar">
                <div
                  className="ara-progress-fill ara-progress-success"
                  style={{ width: `${safeMetrics.collectionRate}%` }}
                ></div>
              </div>
              <span className="ara-progress-text">{formatPercentage(safeMetrics.collectionRate)} collected</span>
            </div>
          </div>
        </div>

        <div className="ara-stat-card ara-stat-pending">
          <div className="ara-stat-icon">⏳</div>
          <div className="ara-stat-content">
            <h3 className="ara-stat-label">Pending Payments</h3>
            <p className="ara-stat-value">{formatCurrency(safeMetrics.pendingRevenue)}</p>
            <div className="ara-stat-meta">
              <span className="ara-stat-badge ara-badge-warning">Uncollected</span>
            </div>
          </div>
        </div>

        <div className="ara-stat-card ara-stat-projects">
          <div className="ara-stat-icon">🏗️</div>
          <div className="ara-stat-content">
            <h3 className="ara-stat-label">Active Projects</h3>
            <p className="ara-stat-value">{safeMetrics.activeProjects}</p>
            <div className="ara-stat-meta">
              <span className="ara-stat-badge ara-badge-info">{safeMetrics.completedProjects} Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Analytics */}
      <div className="ara-phase-section">
        <h3 className="ara-phase-title">Phase-wise Payment Breakdown</h3>
        <div className="ara-phase-grid">
          {Object.entries(phaseAnalytics || {}).map(([phaseKey, phase]) => {
            const phaseNumber = phaseKey === "final" ? "Final" : `Phase ${phaseKey.replace("phase", "")}`;
            const collectionRate = phase.total > 0 ? ((phase.received / phase.total) * 100).toFixed(1) : 0;

            return (
              <div key={phaseKey} className="ara-phase-card">
                <div className="ara-phase-header">
                  <h4 className="ara-phase-name">{phaseNumber}</h4>
                  <span className="ara-phase-rate">{collectionRate}%</span>
                </div>
                <div className="ara-phase-amounts">
                  <div className="ara-phase-amount">
                    <span className="ara-phase-label">Total</span>
                    <span className="ara-phase-value">{formatCurrency(phase.total)}</span>
                  </div>
                  <div className="ara-phase-amount ara-phase-received">
                    <span className="ara-phase-label">Received</span>
                    <span className="ara-phase-value">{formatCurrency(phase.received)}</span>
                  </div>
                  <div className="ara-phase-amount ara-phase-pending">
                    <span className="ara-phase-label">Pending</span>
                    <span className="ara-phase-value">{formatCurrency(phase.pending)}</span>
                  </div>
                </div>
                <div className="ara-phase-progress">
                  <div
                    className="ara-phase-progress-fill"
                    style={{ width: `${collectionRate}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
