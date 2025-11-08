import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarCompany from '../../components/NavbarCompany/NavbarCompany';
import './CompanyOngoingProjects.css';

const CompanyOngoingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const projectsPerPage = 10;

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(data);
      } else {
        alert('Failed to load projects');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLast = currentPage * projectsPerPage;
  const indexOfFirst = indexOfLast - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  const paginate = (page) => setCurrentPage(page);

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  // Update Project Status
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: newStatus } : p));
        if (selectedProject?._id === projectId) {
          setSelectedProject(prev => ({ ...prev, status: newStatus }));
        }
        alert('Status updated');
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <>
      <NavbarCompany />
      <div className="projects-container">
        <div className="projects-header">
          <h1>Ongoing Projects</h1>
          <Link to="/addnewproject_form" className="btn-add">
            Add New Project
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by project name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Projects Table */}
        <div className="table-container">
          {currentProjects.length === 0 ? (
            <p className="no-data">No projects found.</p>
          ) : (
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.map(project => (
                  <tr key={project._id}>
                    <td>
                      <div>
                        <strong>{project.projectName}</strong>
                        <small>{project.projectAddress}</small>
                      </div>
                    </td>
                    <td>₹{parseFloat(project.estimatedBudget).toLocaleString('en-IN')}</td>
                    <td>{project.timeline} months</td>
                    <td>
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${project.completionPercentage}%` }}
                        ></div>
                        <span className="progress-text">{project.completionPercentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${project.status}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-view" onClick={() => openProjectModal(project)}>
                        View
                      </button>
                      <Link to={`/addnewproject_form/${project._id}`} className="btn-edit">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="modal-overlay" onClick={closeProjectModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Project Details</h2>
              <button className="close-btn" onClick={closeProjectModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="project-info">
                <h3>Basic Information</h3>
                <p><strong>Name:</strong> {selectedProject.projectName}</p>
                <p><strong>Address:</strong> {selectedProject.projectAddress}</p>
                <p><strong>Type:</strong> {selectedProject.buildingType}</p>
                <p><strong>Start Date:</strong> {new Date(selectedProject.startDate).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="project-info">
                <h3>Financials</h3>
                <p><strong>Budget:</strong> ₹{parseFloat(selectedProject.estimatedBudget).toLocaleString('en-IN')}</p>
                <p><strong>Timeline:</strong> {selectedProject.timeline} months</p>
              </div>

              <div className="project-info">
                <h3>Progress</h3>
                <div className="progress-container large">
                  <div
                    className="progress-bar"
                    style={{ width: `${selectedProject.completionPercentage}%` }}
                  ></div>
                  <span className="progress-text">{selectedProject.completionPercentage}% Complete</span>
                </div>
              </div>

              {selectedProject.specialRequirements && (
                <div className="project-info">
                  <h3>Special Requirements</h3>
                  <p>{selectedProject.specialRequirements}</p>
                </div>
              )}

              {selectedProject.updates && selectedProject.updates.length > 0 && (
                <div className="project-info">
                  <h3>Progress Updates</h3>
                  <div className="updates-list">
                    {selectedProject.updates.map((update, i) => (
                      <div key={i} className="update-item">
                        <strong>{update.date}:</strong> {update.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.progressImages && selectedProject.progressImages.length > 0 && (
                <div className="project-info">
                  <h3>Progress Images</h3>
                  <div className="images-grid">
                    {selectedProject.progressImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Progress ${i + 1}`}
                        className="progress-image"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="project-info">
                <h3>Status</h3>
                <div className="status-controls">
                  <select
                    value={selectedProject.status}
                    onChange={(e) => handleStatusChange(selectedProject._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <Link
                to={`/addnewproject_form/${selectedProject._id}`}
                className="btn-primary"
              >
                Edit Project
              </Link>
              <button className="btn-secondary" onClick={closeProjectModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyOngoingProjects;