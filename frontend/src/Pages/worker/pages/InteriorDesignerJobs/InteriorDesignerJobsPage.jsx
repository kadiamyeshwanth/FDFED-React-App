import React, { useState, useEffect } from 'react';
import JobListPanel from './components/JobListPanel';
import JobDetailsPanel from './components/JobDetailsPanel';
import ProposalModal from './components/ProposalModal';
import './InteriorDesignerJobs.css';

const InteriorDesignerJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalProjectId, setProposalProjectId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Select first job by default if jobs exist
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/worker/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      // Filter for interior designer jobs only
      const interiorJobs = (data.jobs || []).filter(job => 
        job.type === 'interior' || !job.type || job.roomType
      );
      setJobs(interiorJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    (job.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.projectDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedJob = jobs.find(job => job._id === selectedJobId);

  const handleCreateProposal = (jobId) => {
    setProposalProjectId(jobId);
    setIsProposalModalOpen(true);
  };

  const handleDenyJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to deny this job?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/jobs/${jobId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Rejected', type: 'interior' })
      });

      const data = await response.json();
      if (data.success) {
        alert('Job offer rejected successfully.');
        fetchJobs();
      } else {
        throw new Error(data.error || 'Failed to reject job');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred: ' + err.message);
    }
  };

  const handleProposalSubmit = async (proposalData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/worker/submit-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...proposalData,
          projectType: 'interior'
        })
      });

      const data = await response.json();
      if (data.success || response.ok) {
        alert('Proposal submitted successfully.');
        setIsProposalModalOpen(false);
        fetchJobs();
      } else {
        throw new Error(data.error || 'Failed to submit proposal');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="interior-designer-page">
        <div className="loading">Loading Interior Designer Jobs...</div>
      </div>
    );
  }

  return (
    <div className="interior-designer-page">
      <main className="container">
        <div className="job-dashboard">
          <JobListPanel
            jobs={filteredJobs}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            hasJobs={jobs.length > 0}
          />

          <JobDetailsPanel
            selectedJob={selectedJob}
            onCreateProposal={handleCreateProposal}
            onDenyJob={handleDenyJob}
            hasJobs={jobs.length > 0}
          />
        </div>
      </main>

      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSubmit={handleProposalSubmit}
        projectId={proposalProjectId}
      />

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
};

export default InteriorDesignerJobsPage;
