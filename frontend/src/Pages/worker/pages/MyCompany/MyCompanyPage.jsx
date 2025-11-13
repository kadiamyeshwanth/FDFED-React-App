import React, { useState, useEffect } from 'react';
import CompanyHeader from './components/CompanyHeader';
import ProjectsSection from './components/ProjectsSection';
import './MyCompany.css';

const MyCompanyPage = () => {
  const [company, setCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch worker's company data
      const response = await fetch('/api/worker/my-company', {
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('You have not joined a company yet');
          setCompany(null);
          setProjects([]);
          return;
        }
        throw new Error('Failed to fetch company data');
      }

      const data = await response.json();
      setCompany(data.company);
      setProjects(data.projects || []);
      setChatId(data.chatId);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCompany = async () => {
    if (!window.confirm('Are you sure you want to leave this company?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/worker/leave-company', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCompany(null);
        setProjects([]);
        setError('You have successfully left the company');
        setTimeout(() => {
          setError(null);
          fetchCompanyData();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to leave company');
      }
    } catch (err) {
      console.error('Error leaving company:', err);
      setError('An error occurred while leaving the company');
    }
  };

  if (loading) {
    return (
      <div className="mycompany-container">
        <div className="loading">Loading company information...</div>
      </div>
    );
  }

  return (
    <div className="mycompany-container">
      <div className="container">
        {company ? (
          <>
            <CompanyHeader
              company={company}
              chatId={chatId}
              onLeaveCompany={handleLeaveCompany}
            />
            <ProjectsSection projects={projects} />
          </>
        ) : (
          <div className="no-company-section">
            <h1>You have not joined a company yet</h1>
            <p>Browse available companies and start collaborating with teams!</p>
            <button
              onClick={() => (window.location.href = '/worker/join-company')}
              className="btn btn-primary"
            >
              Explore Companies
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default MyCompanyPage;
