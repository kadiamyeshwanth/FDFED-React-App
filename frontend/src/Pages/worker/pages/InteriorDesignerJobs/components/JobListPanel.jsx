import React from 'react';

const JobListPanel = ({
  jobs,
  selectedJobId,
  onSelectJob,
  searchTerm,
  onSearchChange,
  hasJobs
}) => {
  return (
    <section className="job-list-panel">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search job offers..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <i className="fas fa-search search-icon"></i>
      </div>

      <div className="jobs-container">
        {!hasJobs ? (
          <p className="no-jobs-message">No job offers available.</p>
        ) : jobs.length === 0 ? (
          <p className="no-jobs-message">No results match your search.</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job._id}
              className={`job-card ${selectedJobId === job._id ? 'active' : ''}`}
              onClick={() => onSelectJob(job._id)}
            >
              <span className="job-type interior">
                {job.roomType || 'Interior'}
              </span>
              <h3 className="job-title">
                {job.projectName || 'Untitled Project'}
              </h3>
              <p className="job-budget">
                ₹{job.budget ? job.budget.toLocaleString('en-IN') : 'Budget not specified'}
              </p>
              <p className="job-summary">
                {job.projectDescription || 'No description provided'}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default JobListPanel;
