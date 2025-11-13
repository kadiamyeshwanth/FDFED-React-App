import React, { useState, useEffect } from 'react';
import StatsGrid from './components/StatsGrid';
import OffersSection from './components/OffersSection';
import CompaniesSection from './components/CompaniesSection';
import JobsSection from './components/JobsSection';
import './Dashboard.css';

const DashboardPage = () => {
  const [workerName, setWorkerName] = useState('');
  const [stats, setStats] = useState({
    pendingOffers: 0,
    activeApplications: 0
  });
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [availability, setAvailability] = useState('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data in parallel
      const [offersRes, companiesRes, jobsRes, profileRes] = await Promise.all([
        fetch('/api/worker/offers', { headers }),
        fetch('/api/worker/companies', { headers }),
        fetch('/api/worker/jobs', { headers }),
        fetch('/api/worker/profile', { headers })
      ]);

      let offersData = [];
      let companiesData = [];
      let jobsData = [];
      let profileData = null;

      if (offersRes.ok) {
        const data = await offersRes.json();
        offersData = data.offers ? data.offers.slice(0, 5) : [];
      }

      if (companiesRes.ok) {
        const data = await companiesRes.json();
        companiesData = data.companies ? data.companies.slice(0, 5) : [];
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        jobsData = data.jobs ? data.jobs.slice(0, 5) : [];
      }

      if (profileRes.ok) {
        profileData = await profileRes.json();
        setWorkerName(profileData.name || 'Worker');
        setAvailability(profileData.availability || 'available');
      }

      setOffers(offersData);
      setCompanies(companiesData);
      setJobs(jobsData);

      // Calculate stats
      setStats({
        pendingOffers: offersData.length,
        activeApplications: jobsData.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main>
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Welcome, {workerName}</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <StatsGrid stats={stats} availability={availability} />

          <OffersSection offers={offers} />

          <CompaniesSection companies={companies} />

          <JobsSection jobs={jobs} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
