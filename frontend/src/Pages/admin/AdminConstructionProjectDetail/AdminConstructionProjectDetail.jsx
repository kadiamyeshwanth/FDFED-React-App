import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card, Section, DataRow, Badge, ActionButton, PageHeader, Spinner,
} from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, Trash2, Building2, User, Mail, Phone, Calendar, Clock,
  MapPin, Target, Layers, Ruler, IndianRupee, Zap, Accessibility,
  FileText, CheckCircle, XCircle, AlertTriangle, MessageSquare, X,
} from "lucide-react";
import "./AdminConstructionProjectDetail.css";

const AdminConstructionProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComplaints, setShowComplaints] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(null);
  const [activeTab, setActiveTab] = useState("customer");
  const [unviewedCount, setUnviewedCount] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/construction-project/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setProject(data.project ?? data);
      } catch (err) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    const fetchUnviewedCount = async () => {
      if (!project) return;
      try {
        const res = await fetch(`/api/complaints/unviewed/count`);
        const data = await res.json();
        if (data.success) {
          const projectUnviewed = data.unviewedByProject.find(
            (item) => item._id === project._id
          );
          setUnviewedCount(projectUnviewed ? projectUnviewed.count : 0);
        }
      } catch (err) {
        console.error('Error fetching unviewed count:', err);
      }
    };
    fetchUnviewedCount();
  }, [project]);

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    setComplaintsError(null);
    try {
      const res = await fetch(`/api/complaints/${project._id}`);
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch complaints");
      setComplaints(data.complaints || []);
    } catch (err) {
      setComplaintsError(err.message || "Error fetching complaints");
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleOpenComplaints = () => {
    setShowComplaints(true);
    fetchComplaints();
    setUnviewedCount(0);
    document.body.classList.add("modal-open");
  };

  const handleCloseComplaints = () => {
    setShowComplaints(false);
    document.body.classList.remove("modal-open");
  };

  useEffect(() => {
    return () => document.body.classList.remove("modal-open");
  }, []);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this construction project?"))
      return;
    try {
      const res = await fetch(`/api/admin/delete-constructionProject/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Project deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting project: " + err.message);
    }
  };

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading project...</p></div></AdminLayout>;
  if (error) return <AdminLayout><div className="detail-error"><p>Error: {error}</p></div></AdminLayout>;
  if (!project) return <AdminLayout><div className="detail-empty"><p>Project not found.</p></div></AdminLayout>;

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "Not specified");
  const fmtShort = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtNum = (n) => typeof n === "number" ? n.toLocaleString() : n ?? "Not specified";
  const pct = Math.min(Math.max(Number(project.completionPercentage) || 0, 0), 100);

  const getStatusVariant = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") return "success";
    if (s === "accepted" || s === "ongoing" || s === "in-progress") return "info";
    if (s === "pending") return "warning";
    if (s === "rejected" || s === "cancelled") return "danger";
    return "default";
  };

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title={project.projectName ?? "Construction Project"}
          subtitle={`Project ID: ${project._id}`}
          actions={
            <div className="detail-header-actions">
              <ActionButton label="Back" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
              <div style={{ position: "relative" }}>
                <ActionButton label="Complaints" icon={MessageSquare} variant="primary" onClick={handleOpenComplaints} />
                {unviewedCount > 0 && <span className="notif-badge">{unviewedCount}</span>}
              </div>
              <ActionButton label="Delete" icon={Trash2} variant="danger" onClick={handleDelete} />
            </div>
          }
        />

        {/* KPI Row */}
        <div className="detail-kpi-row">
          <div className="detail-kpi-card kpi-blue">
            <Target size={20} />
            <div>
              <span className="kpi-val">{pct}%</span>
              <span className="kpi-lbl">Completion</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-green">
            <CheckCircle size={20} />
            <div>
              <span className="kpi-val">{project.status ?? "—"}</span>
              <span className="kpi-lbl">Status</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-purple">
            <Layers size={20} />
            <div>
              <span className="kpi-val">{project.currentPhase ?? "—"}</span>
              <span className="kpi-lbl">Current Phase</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-orange">
            <IndianRupee size={20} />
            <div>
              <span className="kpi-val">{fmtNum(project.estimatedBudget)}</span>
              <span className="kpi-lbl">Est. Budget</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="progress-card">
          <div className="progress-info">
            <span className="progress-label">Project Completion</span>
            <span className="progress-pct">{pct}%</span>
          </div>
          <div className="detail-progress-bar">
            <div className="detail-progress-fill" style={{ width: `${pct}%` }}></div>
          </div>
        </Card>

        {/* Project Status */}
        <Section title="Project Status">
          <Card>
            <div className="detail-grid">
              <DataRow label="Status">
                <Badge variant={getStatusVariant(project.status)}>{project.status ?? "—"}</Badge>
              </DataRow>
              <DataRow label="Current Phase">{project.currentPhase ?? "Not specified"}</DataRow>
              <DataRow label="Target Completion">{fmtShort(project.targetCompletionDate)}</DataRow>
              <DataRow label="Completion">{pct}%</DataRow>
            </div>
          </Card>
        </Section>

        {/* Customer Info */}
        <Section title="Customer Information">
          <Card>
            <div className="detail-grid">
              <DataRow label="Customer Name">{project.customerName ?? project.customerId?.name ?? "—"}</DataRow>
              <DataRow label="Email">{project.customerEmail ?? project.customerId?.email ?? "—"}</DataRow>
              <DataRow label="Phone">{project.customerPhone ?? project.customerId?.phone ?? "—"}</DataRow>
            </div>
          </Card>
        </Section>

        {/* Project Details */}
        <Section title="Project Details">
          <Card>
            <div className="detail-grid">
              <DataRow label="Building Type">{project.buildingType ?? "—"}</DataRow>
              <DataRow label="Total Area">{fmtNum(project.totalArea)} sq ft</DataRow>
              <DataRow label="Total Floors">{project.totalFloors ?? "—"}</DataRow>
              <DataRow label="Estimated Budget">₹{fmtNum(project.estimatedBudget)}</DataRow>
              <DataRow label="Timeline">{project.projectTimeline ?? "—"} months</DataRow>
              <DataRow label="Accessibility Needs">{project.accessibilityNeeds ?? "None"}</DataRow>
              <DataRow label="Energy Efficiency">{project.energyEfficiency ?? "Standard"}</DataRow>
              <DataRow label="Project Address">{project.projectAddress ?? "—"}</DataRow>
              {project.projectLocationPincode && (
                <DataRow label="Pincode">{project.projectLocationPincode}</DataRow>
              )}
              {project.specialRequirements && (
                <DataRow label="Special Req.">{project.specialRequirements}</DataRow>
              )}
            </div>
          </Card>
        </Section>

        {/* Floors */}
        {Array.isArray(project.floors) && project.floors.length > 0 && (
          <Section title={`Floor Details (${project.floors.length})`}>
            <div className="detail-items-grid">
              {project.floors.map((floor, i) => (
                <Card key={i} className="detail-floor-card">
                  <div className="floor-header">
                    <Badge variant="info">Floor {floor.floorNumber}</Badge>
                    <span className="floor-type">{floor.floorType}</span>
                  </div>
                  <div className="floor-area">{floor.floorArea} sq ft</div>
                  {floor.floorDescription && <p className="floor-desc">{floor.floorDescription}</p>}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Milestones */}
        {Array.isArray(project.milestones) && project.milestones.length > 0 && (
          <Section title={`Milestones & Progress (${project.milestones.filter(m => m.isCheckpoint).length})`}>
            {project.milestones
              .filter((m) => m.isCheckpoint)
              .sort((a, b) => a.percentage - b.percentage)
              .map((milestone, idx) => {
                const approved = milestone.isApprovedByCustomer;
                const revision = milestone.needsRevision;
                const variant = approved ? "success" : revision ? "danger" : "warning";
                return (
                  <Card key={idx} className={`detail-milestone-card milestone-${variant}`}>
                    <div className="milestone-header">
                      <div className="milestone-title-row">
                        <h4>{milestone.percentage}% Milestone</h4>
                        {approved && <Badge variant="success"><CheckCircle size={12} /> Approved</Badge>}
                        {revision && <Badge variant="danger"><AlertTriangle size={12} /> Revision</Badge>}
                        {!approved && !revision && <Badge variant="warning"><Clock size={12} /> Awaiting</Badge>}
                      </div>
                      <div className="milestone-dates">
                        <span>Submitted: {fmt(milestone.submittedAt)}</span>
                        {milestone.approvedAt && <span>Approved: {fmt(milestone.approvedAt)}</span>}
                      </div>
                    </div>

                    <div className="milestone-report">
                      <h5>Company Progress Report</h5>
                      <p>{milestone.companyMessage}</p>
                    </div>

                    {/* Conversation History */}
                    {milestone.conversation && milestone.conversation.length > 0 && (
                      <div className="milestone-conversation">
                        <h5>Conversation ({milestone.conversation.length})</h5>
                        <div className="detail-conversation">
                          {milestone.conversation.map((msg, msgIdx) => (
                            <div key={msgIdx} className={`detail-msg ${msg.sender}`}>
                              <div className="detail-msg-header">
                                <span className="detail-msg-sender">
                                  {msg.sender === 'company' ? 'Company' : 'Customer'}
                                </span>
                                <span>{new Date(msg.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <p style={{ margin: 0 }}>{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {milestone.needsRevision && milestone.customerFeedback && (
                      <div className="milestone-feedback">
                        <h5>Customer Feedback for Revision</h5>
                        <p>{milestone.customerFeedback}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
          </Section>
        )}

        {/* Timestamps */}
        <Section title="Timestamps">
          <Card>
            <div className="detail-grid">
              <DataRow label="Created At">{fmt(project.createdAt)}</DataRow>
              <DataRow label="Last Updated">{fmt(project.updatedAt)}</DataRow>
            </div>
          </Card>
        </Section>
      </div>

      {/* Complaints Modal */}
      {showComplaints && (
        <div className="complaints-overlay" onClick={handleCloseComplaints}>
          <div className="complaints-modal" onClick={(e) => e.stopPropagation()}>
            <div className="complaints-header">
              <h2>Project Complaints</h2>
              <button className="complaints-close" onClick={handleCloseComplaints}>
                <X size={20} />
              </button>
            </div>

            <div className="complaints-tabs">
              <button
                className={`complaints-tab ${activeTab === "customer" ? "active" : ""}`}
                onClick={() => setActiveTab("customer")}
              >
                <User size={14} /> Customer Complaints
              </button>
              <button
                className={`complaints-tab ${activeTab === "company" ? "active-company" : ""}`}
                onClick={() => setActiveTab("company")}
              >
                <Building2 size={14} /> Company Complaints
              </button>
            </div>

            <div className="complaints-body">
              {complaintsLoading ? (
                <div className="detail-loading" style={{ minHeight: "200px" }}><Spinner /><p>Loading complaints...</p></div>
              ) : complaintsError ? (
                <div className="detail-error"><p>{complaintsError}</p></div>
              ) : complaints.filter((c) => c.senderType === activeTab).length === 0 ? (
                <div className="detail-empty" style={{ minHeight: "200px" }}>
                  <p>No {activeTab} complaints found for this project.</p>
                </div>
              ) : (
                complaints
                  .filter((c) => c.senderType === activeTab)
                  .map((c) => (
                    <div key={c._id} className="complaint-card">
                      <div className="complaint-header">
                        <Badge variant="warning">
                          {c.milestone === 0 ? 'General Complaint' : `Milestone: ${c.milestone}%`}
                        </Badge>
                        <span style={{ fontSize: "13px", color: "#6b7280" }}>
                          {new Date(c.createdAt).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="complaint-message">{c.message}</div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminConstructionProjectDetail;
