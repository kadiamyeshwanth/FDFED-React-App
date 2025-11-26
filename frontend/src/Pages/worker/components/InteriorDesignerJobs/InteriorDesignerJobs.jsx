import React, { useState, useEffect } from 'react';
import './InteriorDesignerJobs.css';
import JobListPanel from './sub-components/JobListPanel';
import JobDetailsPanel from './sub-components/JobDetailsPanel';

const InteriorDesignerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.projectDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

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
      const jobList = data.jobs || [];
      setJobs(jobList);
      setFilteredJobs(jobList);
      
      if (selectedJob) {
        const stillExists = jobList.find(job => job._id === selectedJob._id);
        if (!stillExists) {
          setSelectedJob(jobList.length > 0 ? jobList[0] : null);
        }
      } else if (jobList.length > 0) {
        setSelectedJob(jobList[0]);
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
        body: JSON.stringify({ status, type: 'interior' })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Job offer ${status.toLowerCase()} successfully.`);
        fetchJobs();
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
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
      <div className="wkidj-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wkidj-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="wkidj-container">
      <div className="wkidj-job-dashboard">
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
          formatDate={formatDate}
        />
      </div>
    </main>
  );
};

export default InteriorDesignerJobs;
