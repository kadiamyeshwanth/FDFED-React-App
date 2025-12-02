import React, { useEffect, useState } from "react";
import "./CompanyRevenue.css";
import StatsCards from "./components/StatsCards";
import ProjectsTable from "./components/ProjectsTable";
import SidebarStats from "./components/SidebarStats";
import ProjectDetailsModal from "./components/ProjectDetailsModal";

const CompanyRevenue = () => {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/companyrevenue", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch revenue data");
        const data = await res.json();
        setProjects(data.projects || []);
        setMetrics(data.metrics || null);
      } catch (err) {
        console.error(err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const calculateEndDate = (project) => {
    if (project.status === "completed") {
      return formatDate(project.updatedAt);
    }
    if (project.projectTimeline) {
      const endDate = new Date(project.createdAt);
      endDate.setMonth(endDate.getMonth() + parseInt(project.projectTimeline));
      return formatDate(endDate);
    }
    return "N/A";
  };

  if (loading) {
    return (
      <div className="revenue-container">
        <div className="revenue-loading">Loading revenue data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revenue-container">
        <div className="revenue-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="revenue-main-container">
      <h1 className="revenue-page-title">Financial Dashboard</h1>

      <StatsCards metrics={metrics} formatCurrency={formatCurrency} />

      {/* CONTENT WRAPPER */}
      <div className="revenue-content-wrapper">
        {/* MAIN SECTION */}
        <div className="revenue-main-section">
          <h2>All Projects</h2>
          <ProjectsTable 
            projects={projects}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onViewDetails={handleViewDetails}
          />
        </div>

        <SidebarStats metrics={metrics} formatCurrency={formatCurrency} />
      </div>

      <ProjectDetailsModal 
        isOpen={modalOpen}
        project={selectedProject}
        onClose={handleCloseModal}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        calculateEndDate={calculateEndDate}
      />
    </div>
  );
};

export default CompanyRevenue;