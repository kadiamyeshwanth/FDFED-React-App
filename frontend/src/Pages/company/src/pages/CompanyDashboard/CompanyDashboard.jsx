import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarCompany from '../../components/NavbarCompany/NavbarCompany';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    pendingBids: 0,
    totalRevenue: 0,
    employees: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch stats
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      // Fetch recent projects
      const projectsRes = await fetch('/api/projects/recent?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();

      // Fetch recent bids
      const bidsRes = await fetch('/api/bids/recent?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bidsData = await bidsRes.json();

      if (statsRes.ok && projectsRes.ok && bidsRes.ok) {
        setStats(statsData);
        setRecentProjects(projectsData);
        setRecentBids(bidsData);
      } else {
        alert('Failed to load dashboard data');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavbarCompany />
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <NavbarCompany />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Company Dashboard</h1>
          <p>Welcome back! Here's your construction business overview.</p>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon projects"></div>
            <div className="stat-info">
              <h3>{stats.totalProjects}</h3>
              <p>Total Projects</p>
            </div>
            <Link to="/companyongoing_projects" className="stat-link">View All</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon ongoing"></div>
            <div className="stat-info">
              <h3>{stats.ongoingProjects}</h3>
              <p>Ongoing Projects</p>
            </div>
            <Link to="/companyongoing_projects" className="stat-link">View</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed"></div>
            <div className="stat-info">
              <h3>{stats.completedProjects}</h3>
              <p>Completed</p>
            </div>
            <Link to="/companyongoing_projects" className="stat-link">View</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon bids"></div>
            <div className="stat-info">
              <h3>{stats.pendingBids}</h3>
              <p>Pending Bids</p>
            </div>
            <Link to="/companybids" className="stat-link">Review</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue"></div>
            <div className="stat-info">
              <h3>₹{parseFloat(stats.totalRevenue).toLocaleString('en-IN')}</h3>
              <p>Total Revenue</p>
            </div>
            <Link to="/companyrevenue" className="stat-link">Details</Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon employees"></div>
            <div className="stat-info">
              <h3>{stats.employees}</h3>
              <p>Employees</p>
            </div>
            <Link to="/my-employees" className="stat-link">Manage</Link>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Projects */}
          <div className="section">
            <div className="section-header">
              <h2>Recent Projects</h2>
              <Link to="/companyongoing_projects" className="view-all">View All</Link>
            </div>
            {recentProjects.length === 0 ? (
              <p className="no-data">No projects yet.</p>
            ) : (
              <div className="projects-list">
                {recentProjects.map(project => (
                  <div key={project._id} className="project-item">
                    <div className="project-info">
                      <h4>{project.projectName}</h4>
                      <p>{project.projectAddress}</p>
                      <div className="project-meta">
                        <span className={`status ${project.status}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <span className="progress">
                          {project.completionPercentage}% Complete
                        </span>
                      </div>
                    </div>
                    <div className="project-progress">
                      <div
                        className="progress-bar"
                        style={{ width: `${project.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bids */}
          <div className="section">
            <div className="section-header">
              <h2>Recent Bids</h2>
              <Link to="/companybids" className="view-all">View All</Link>
            </div>
            {recentBids.length === 0 ? (
              <p className="no-data">No bids received.</p>
            ) : (
              <div className="bids-list">
                {recentBids.map(bid => (
                  <div key={bid._id} className="bid-item">
                    <div className="bid-info">
                      <h4>{bid.projectName}</h4>
                      <p><strong>Contractor:</strong> {bid.contractorName}</p>
                      <p><strong>Amount:</strong> ₹{parseFloat(bid.bidAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bid-status">
                      <span className={`status-badge ${bid.status}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/addnewproject_form" className="action-card">
              <div className="action-icon add-project"></div>
              <span>Add New Project</span>
            </Link>
            <Link to="/project_requests" className="action-card">
              <div className="action-icon requests"></div>
              <span>View Project Requests</span>
            </Link>
            <Link to="/companyhiring" className="action-card">
              <div className="action-icon hire"></div>
              <span>Hire Workers</span>
            </Link>
            <Link to="/revenueform" className="action-card">
              <div className="action-icon revenue"></div>
              <span>Add Revenue</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDashboard;