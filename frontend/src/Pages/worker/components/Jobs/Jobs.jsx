import React, { useState, useEffect } from 'react';
import './Jobs.css';
import JobListPanel from './sub-components/JobListPanel';
import JobDetailsPanel from './sub-components/JobDetailsPanel';

const Jobs = () => {
  const [jobOffers, setJobOffers] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({ price: '', description: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredJobs(jobOffers);
    } else {
      const filtered = jobOffers.filter(job => 
        job.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.designRequirements?.specialFeatures?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.designRequirements?.designType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobOffers]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/worker/jobs', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      setUser(data.user);
      const jobs = data.jobOffers || [];
      setJobOffers(jobs);
      setFilteredJobs(jobs);
      
      // Check if the currently selected job still exists in the new list
      if (selectedJob) {
        const stillExists = jobs.find(job => job._id === selectedJob._id);
        if (!stillExists) {
          // If selected job was removed, select the first job or null
          setSelectedJob(jobs.length > 0 ? jobs[0] : null);
        }
      } else if (jobs.length > 0) {
        setSelectedJob(jobs[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const updateJobStatus = async (jobId, status) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this job?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, type: 'architect' })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Job offer ${status.toLowerCase()} successfully.`);
        fetchJobs(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred: ' + error.message);
    }
  };

  const handleCreateProposal = () => {
    setShowProposalModal(true);
  };

  const handleCloseProposalModal = () => {
    setShowProposalModal(false);
    setProposalData({ price: '', description: '' });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    
    if (!proposalData.price || !proposalData.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/worker/submit-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: selectedJob._id,
          projectType: 'architect',
          price: proposalData.price,
          description: proposalData.description
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Proposal submitted successfully!');
        handleCloseProposalModal();
        fetchJobs(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to submit proposal');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('An error occurred: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="wkj-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wkj-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="wkj-container">
      <div className="wkj-job-dashboard">
        <JobListPanel 
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          jobs={filteredJobs}
          selectedJob={selectedJob}
          onJobSelect={handleJobSelect}
        />
        <JobDetailsPanel 
          selectedJob={selectedJob}
          onAccept={() => updateJobStatus(selectedJob._id, 'Accepted')}
          onReject={() => updateJobStatus(selectedJob._id, 'Rejected')}
          onCreateProposal={handleCreateProposal}
          formatDate={formatDate}
        />
        
        {/* Proposal Modal */}
        {showProposalModal && (
          <div className="wkj-modal" onClick={handleCloseProposalModal}>
            <div className="wkj-modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="wkj-close-modal" onClick={handleCloseProposalModal}>&times;</span>
              <div className="wkj-modal-header">
                <h2>Create Proposal</h2>
              </div>
              <div className="wkj-modal-body">
                <form onSubmit={handleProposalSubmit}>
                  <div className="wkj-form-group">
                    <label htmlFor="proposalPrice">Project Price (₹)</label>
                    <input 
                      type="number" 
                      id="proposalPrice" 
                      value={proposalData.price}
                      onChange={(e) => setProposalData({...proposalData, price: e.target.value})}
                      placeholder="Enter project price"
                      required
                    />
                  </div>
                  <div className="wkj-form-group">
                    <label htmlFor="proposalDescription">Description of Services</label>
                    <textarea 
                      id="proposalDescription" 
                      rows="4"
                      value={proposalData.description}
                      onChange={(e) => setProposalData({...proposalData, description: e.target.value})}
                      placeholder="e.g., Complete architectural blueprints for a 3-bedroom house, including 2 revisions."
                      required
                    />
                  </div>
                  <button type="submit" className="wkj-job-action-button wkj-accept-button">
                    <i className="fas fa-file-signature"></i> Submit Proposal
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Jobs;
