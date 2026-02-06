import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCards from "./components/StatsCards";
import ProjectsTable from "./components/ProjectsTable";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import "./AdminRevenueAnalytics.css";

const AdminRevenueAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/revenue", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📊 Admin Revenue Data received:", result);
      
      if (result.success) {
        setData(result);
        console.log("✅ Revenue data set successfully:", {
          totalProjects: result.projects?.length,
          totalRevenue: result.metrics?.totalRevenue,
          receivedRevenue: result.metrics?.receivedRevenue
        });
      } else {
        throw new Error(result.error || "Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("❌ Error fetching revenue data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="ara-loading-container">
        <div className="ara-loading-spinner"></div>
        <p>Loading revenue analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ara-error-container">
        <div className="ara-error-icon">⚠️</div>
        <h2>Error Loading Revenue Data</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/admin/admindashboard")} className="ara-btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!data || !data.metrics) {
    return (
      <div className="ara-empty-container">
        <p>No revenue data available</p>
        <button onClick={() => navigate("/admin/admindashboard")} className="ara-btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="ara-container">
      <header className="ara-header">
        <div className="ara-header-content">
          <button onClick={() => navigate("/admin/admindashboard")} className="ara-btn-back-header">
            ← Back
          </button>
          <div className="ara-header-text">
            <h1 className="ara-title">Platform Revenue Analytics</h1>
            <p className="ara-subtitle">
              Comprehensive overview of all construction projects, companies, and payment tracking
            </p>
          </div>
        </div>
      </header>

      <main className="ara-main">
        <StatsCards metrics={data.metrics} phaseAnalytics={data.phaseAnalytics} />
        
        <div className="ara-projects-section">
          <h2 className="ara-section-title">All Construction Projects</h2>
          <ProjectsTable projects={data.projects} onViewDetails={handleViewDetails} />
        </div>
      </main>

      {showModal && selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AdminRevenueAnalytics;
