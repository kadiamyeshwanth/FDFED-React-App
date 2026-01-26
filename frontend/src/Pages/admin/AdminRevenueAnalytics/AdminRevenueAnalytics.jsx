import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import { PageHeader, ActionButton, Spinner, Card, Badge } from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, IndianRupee, TrendingUp, Clock, Building2,
  CheckCircle, Eye, X,
} from "lucide-react";
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
      const response = await fetch("/api/admin/revenue", { credentials: "include" });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.error || "Failed to fetch revenue data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
    document.body.classList.add("modal-open");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
    document.body.classList.remove("modal-open");
  };

  useEffect(() => {
    return () => document.body.classList.remove("modal-open");
  }, []);

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString("en-IN")}`;
  const formatPercentage = (value) => `${(value || 0).toFixed(1)}%`;

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading revenue analytics...</p></div></AdminLayout>;
  if (error) return (
    <AdminLayout>
      <div className="detail-error">
        <p>Error: {error}</p>
        <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
      </div>
    </AdminLayout>
  );
  if (!data || !data.metrics) return (
    <AdminLayout>
      <div className="detail-empty"><p>No revenue data available</p></div>
    </AdminLayout>
  );

  const metrics = data.metrics;

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title="Platform Revenue Analytics"
          subtitle="Comprehensive overview of all construction projects, companies, and payment tracking"
          actions={
            <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
          }
        />

        {/* Stats Cards */}
        <div className="revenue-stats-grid">
          <div className="revenue-stat-card stat-total">
            <div className="revenue-stat-icon"><IndianRupee size={22} /></div>
            <div className="revenue-stat-content">
              <span className="revenue-stat-label">Total Platform Revenue</span>
              <span className="revenue-stat-value">{formatCurrency(metrics.totalRevenue)}</span>
              <Badge variant="info">{metrics.totalProjects || 0} Projects</Badge>
            </div>
          </div>
          <div className="revenue-stat-card stat-received">
            <div className="revenue-stat-icon received"><CheckCircle size={22} /></div>
            <div className="revenue-stat-content">
              <span className="revenue-stat-label">Total Received</span>
              <span className="revenue-stat-value">{formatCurrency(metrics.receivedRevenue)}</span>
              <div className="revenue-mini-bar">
                <div className="revenue-mini-fill success" style={{ width: `${metrics.collectionRate || 0}%` }}></div>
              </div>
              <span className="revenue-stat-meta">{formatPercentage(metrics.collectionRate)} collected</span>
            </div>
          </div>
          <div className="revenue-stat-card stat-pending">
            <div className="revenue-stat-icon pending"><Clock size={22} /></div>
            <div className="revenue-stat-content">
              <span className="revenue-stat-label">Pending Payments</span>
              <span className="revenue-stat-value">{formatCurrency(metrics.pendingRevenue)}</span>
              <Badge variant="warning">Uncollected</Badge>
            </div>
          </div>
          <div className="revenue-stat-card stat-projects">
            <div className="revenue-stat-icon projects"><Building2 size={22} /></div>
            <div className="revenue-stat-content">
              <span className="revenue-stat-label">Active Projects</span>
              <span className="revenue-stat-value">{metrics.activeProjects || 0}</span>
              <Badge variant="success">{metrics.completedProjects || 0} Completed</Badge>
            </div>
          </div>
        </div>

        {/* Phase Analytics */}
        {data.phaseAnalytics && Object.keys(data.phaseAnalytics).length > 0 && (
          <Card className="phase-analytics-card">
            <h3 className="phase-analytics-title">Phase-wise Payment Breakdown</h3>
            <div className="phase-grid">
              {Object.entries(data.phaseAnalytics).map(([phaseKey, phase]) => {
                const phaseNumber = phaseKey === "final" ? "Final" : `Phase ${phaseKey.replace("phase", "")}`;
                const collectionRate = phase.total > 0 ? ((phase.received / phase.total) * 100).toFixed(1) : 0;
                return (
                  <div key={phaseKey} className="phase-card">
                    <div className="phase-header">
                      <h4>{phaseNumber}</h4>
                      <span className="phase-rate">{collectionRate}%</span>
                    </div>
                    <div className="phase-amounts">
                      <div className="phase-amount"><span className="phase-label">Total</span><span className="phase-value">{formatCurrency(phase.total)}</span></div>
                      <div className="phase-amount"><span className="phase-label">Received</span><span className="phase-value received-text">{formatCurrency(phase.received)}</span></div>
                      <div className="phase-amount"><span className="phase-label">Pending</span><span className="phase-value pending-text">{formatCurrency(phase.pending)}</span></div>
                    </div>
                    <div className="revenue-mini-bar">
                      <div className="revenue-mini-fill primary" style={{ width: `${collectionRate}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Projects Table */}
        <Card>
          <h3 className="projects-table-title">All Construction Projects</h3>
          {data.projects && data.projects.length > 0 ? (
            <div className="revenue-table-wrapper">
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Company</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Total Amount</th>
                    <th>Received</th>
                    <th>Pending</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.projects.map((project) => {
                    const collectionRate = project.totalAmount > 0
                      ? ((project.receivedAmount / project.totalAmount) * 100).toFixed(1) : 0;
                    const statusVariant = (() => {
                      const s = (project.status || "").toLowerCase();
                      if (s === "completed") return "success";
                      if (s === "accepted" || s === "ongoing") return "info";
                      return "warning";
                    })();
                    return (
                      <tr key={project._id}>
                        <td><strong>{project.projectName}</strong></td>
                        <td>
                          <div>{project.company.name}</div>
                          {project.company.contactPerson && <small className="table-meta">{project.company.contactPerson}</small>}
                        </td>
                        <td>
                          <div>{project.customer.name}</div>
                          {project.customer.phone && <small className="table-meta">{project.customer.phone}</small>}
                        </td>
                        <td><Badge variant={statusVariant}>{project.status || "Unknown"}</Badge></td>
                        <td>
                          <div className="progress-cell">
                            <div className="revenue-mini-bar"><div className="revenue-mini-fill success" style={{ width: `${project.completionPercentage}%` }}></div></div>
                            <span className="progress-text">{project.completionPercentage}%</span>
                          </div>
                        </td>
                        <td className="amount-cell">{formatCurrency(project.totalAmount)}</td>
                        <td className="amount-cell received-text">{formatCurrency(project.receivedAmount)}</td>
                        <td className="amount-cell pending-text">{formatCurrency(project.pendingAmount)}</td>
                        <td>
                          <ActionButton label="View" icon={Eye} variant="primary" size="sm" onClick={() => handleViewDetails(project)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="detail-empty" style={{ minHeight: "200px" }}><p>No projects found</p></div>
          )}
        </Card>
      </div>

      {/* Project Details Modal */}
      {showModal && selectedProject && (
        <div className="revenue-modal-overlay" onClick={handleCloseModal}>
          <div className="revenue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="revenue-modal-header">
              <h2>{selectedProject.projectName}</h2>
              <button className="revenue-modal-close" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            <div className="revenue-modal-body">
              {/* Summary cards */}
              <div className="modal-summary-grid">
                <div className="modal-summary-card">
                  <span className="modal-summary-label">Total Amount</span>
                  <span className="modal-summary-value">{formatCurrency(selectedProject.totalAmount)}</span>
                </div>
                <div className="modal-summary-card">
                  <span className="modal-summary-label">Received</span>
                  <span className="modal-summary-value received-text">{formatCurrency(selectedProject.receivedAmount)}</span>
                </div>
                <div className="modal-summary-card">
                  <span className="modal-summary-label">Pending</span>
                  <span className="modal-summary-value pending-text">{formatCurrency(selectedProject.pendingAmount)}</span>
                </div>
              </div>

              {/* Project Info */}
              <div className="modal-info-section">
                <h3>Project Information</h3>
                <div className="modal-info-grid">
                  <div className="modal-info-item"><span className="modal-info-label">Status</span><span className="modal-info-value">{selectedProject.status}</span></div>
                  <div className="modal-info-item"><span className="modal-info-label">Progress</span><span className="modal-info-value">{selectedProject.completionPercentage}%</span></div>
                  <div className="modal-info-item"><span className="modal-info-label">Company</span><span className="modal-info-value">{selectedProject.company.name}</span></div>
                  <div className="modal-info-item"><span className="modal-info-label">Contact Person</span><span className="modal-info-value">{selectedProject.company.contactPerson || "N/A"}</span></div>
                  <div className="modal-info-item"><span className="modal-info-label">Customer</span><span className="modal-info-value">{selectedProject.customer.name}</span></div>
                  <div className="modal-info-item"><span className="modal-info-label">Customer Phone</span><span className="modal-info-value">{selectedProject.customer.phone || "N/A"}</span></div>
                </div>
              </div>

              {/* Phase Breakdown */}
              <div className="modal-phases-section">
                <h3>Phase-wise Payment Breakdown</h3>
                {selectedProject.phaseBreakdown.map((phase) => (
                  <div key={phase.phase} className="modal-phase-detail">
                    <div className="modal-phase-header">
                      <h4>{phase.isFinal ? "Final Phase (100%)" : `Phase ${phase.phase} (${phase.phase * 25}%)`}</h4>
                      <span className="modal-phase-total">{formatCurrency(phase.totalAmount)}</span>
                    </div>

                    {!phase.isFinal && (
                      <div className="modal-payments">
                        <div className="modal-payment-item">
                          <div className="modal-payment-info">
                            <span>Upfront Payment (40%)</span>
                            <span>{formatCurrency(phase.upfront.amount)}</span>
                          </div>
                          <div className="modal-payment-status">
                            <Badge variant={phase.upfront.status === "released" || phase.upfront.status === "paid" ? "success" : "warning"}>
                              {phase.upfront.status === "released" || phase.upfront.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                            {phase.upfront.received > 0 && <span className="received-text">{formatCurrency(phase.upfront.received)}</span>}
                          </div>
                        </div>
                        <div className="modal-payment-item">
                          <div className="modal-payment-info">
                            <span>Completion Payment (60%)</span>
                            <span>{formatCurrency(phase.completion.amount)}</span>
                          </div>
                          <div className="modal-payment-status">
                            <Badge variant={phase.completion.status === "released" || phase.completion.status === "paid" ? "success" : "warning"}>
                              {phase.completion.status === "released" || phase.completion.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                            {phase.completion.received > 0 && <span className="received-text">{formatCurrency(phase.completion.received)}</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {phase.isFinal && (
                      <div className="modal-payments">
                        <div className="modal-payment-item">
                          <div className="modal-payment-info">
                            <span>Final Payment (10% of total)</span>
                            <span>{formatCurrency(phase.final.amount)}</span>
                          </div>
                          <div className="modal-payment-status">
                            <Badge variant={phase.final.status === "released" || phase.final.status === "paid" ? "success" : "warning"}>
                              {phase.final.status === "released" || phase.final.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                            {phase.final.received > 0 && <span className="received-text">{formatCurrency(phase.final.received)}</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="modal-phase-summary">
                      <div><span>Received:</span> <strong className="received-text">{formatCurrency(phase.totalReceived)}</strong></div>
                      <div><span>Pending:</span> <strong className="pending-text">{formatCurrency(phase.totalPending)}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="revenue-modal-footer">
              <ActionButton label="Close" variant="secondary" onClick={handleCloseModal} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRevenueAnalytics;
