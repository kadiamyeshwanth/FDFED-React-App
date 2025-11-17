import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminConstructionProjectDetail.css";

const AdminConstructionProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // leave empty to use same origin or set VITE_API_URL

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/construction-project/${id}`);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this construction project?")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-constructionProject/${id}`, {
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

  if (loading) return <div className="acp-loading">Loading project…</div>;
  if (error) return <div className="acp-error">Error: {error}</div>;
  if (!project) return <div className="acp-empty">Project not found.</div>;

  const fmt = (d) => (d ? new Date(d).toLocaleString() : "Not specified");
  const fmtShort = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtNum = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "Not specified");
  const pct = Math.min(Math.max(Number(project.completionPercentage) || 0, 0), 100);

  return (
    <div className="acp-container">
      <header className="acp-header">
        <h1 className="acp-title">🏗️ Construction Project Details</h1>
        <div className="acp-actions">
          <button className="acp-btn acp-back" onClick={() => navigate("/admindashboard")}>
            ← Back to Dashboard
          </button>
          <button className="acp-btn acp-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </header>

      <main className="acp-card">
        <section className="acp-section acp-section-header">
          <h2 className="acp-section-title">{project.projectName ?? "Construction Project"}</h2>
          <p className="acp-subtitle">Project ID: {project._id}</p>
        </section>

        <h3 className="acp-section-heading">Project Status</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Status</label>
            <div className="acp-value"><span className={`acp-badge acp-badge-${String(project.status ?? "").toLowerCase()}`}>{project.status ?? "—"}</span></div>
          </div>

          <div className="acp-item">
            <label className="acp-label">Current Phase</label>
            <div className="acp-value">{project.currentPhase ?? "Not specified"}</div>
          </div>

          <div className="acp-item">
            <label className="acp-label">Completion Percentage</label>
            <div className="acp-value">
              {pct}%
              <div className="acp-progress-bar" aria-hidden>
                <div className="acp-progress-fill" style={{ width: `${pct}%` }}>{pct}%</div>
              </div>
            </div>
          </div>

          <div className="acp-item">
            <label className="acp-label">Target Completion Date</label>
            <div className="acp-value">{fmtShort(project.targetCompletionDate)}</div>
          </div>
        </div>

        <h3 className="acp-section-heading">Customer Information</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Customer Name</label>
            <div className="acp-value">{project.customerName ?? project.customerId?.name ?? "—"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Email</label>
            <div className="acp-value">{project.customerEmail ?? project.customerId?.email ?? "—"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Phone</label>
            <div className="acp-value">{project.customerPhone ?? project.customerId?.phone ?? "—"}</div>
          </div>
        </div>

        <h3 className="acp-section-heading">Project Details</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Building Type</label>
            <div className="acp-value">{project.buildingType ?? "—"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Total Area</label>
            <div className="acp-value">{fmtNum(project.totalArea)} sq ft</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Total Floors</label>
            <div className="acp-value">{project.totalFloors ?? "—"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Estimated Budget</label>
            <div className="acp-value">₹{fmtNum(project.estimatedBudget)}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Project Timeline</label>
            <div className="acp-value">{project.projectTimeline ?? "—"} months</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Accessibility Needs</label>
            <div className="acp-value">{project.accessibilityNeeds ?? "None"}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Energy Efficiency</label>
            <div className="acp-value">{project.energyEfficiency ?? "Standard"}</div>
          </div>

          <div className="acp-item acp-full">
            <label className="acp-label">Project Address</label>
            <div className="acp-value">{project.projectAddress ?? "—"}</div>
          </div>

          {project.projectLocationPincode && (
            <div className="acp-item">
              <label className="acp-label">Pincode</label>
              <div className="acp-value">{project.projectLocationPincode}</div>
            </div>
          )}

          {project.specialRequirements && (
            <div className="acp-item acp-full">
              <label className="acp-label">Special Requirements</label>
              <div className="acp-value">{project.specialRequirements}</div>
            </div>
          )}
        </div>

        {Array.isArray(project.floors) && project.floors.length > 0 && (
          <>
            <h3 className="acp-section-heading">Floor Details ({project.floors.length})</h3>
            {project.floors.map((floor, i) => (
              <div className="acp-floor-card" key={i}>
                <strong>Floor {floor.floorNumber}:</strong> {floor.floorType} | {floor.floorArea} sq ft
                {floor.floorDescription && <div className="acp-floor-desc">{floor.floorDescription}</div>}
              </div>
            ))}
          </>
        )}

        <h3 className="acp-section-heading">Timestamps</h3>
        <div className="acp-grid">
          <div className="acp-item">
            <label className="acp-label">Created At</label>
            <div className="acp-value">{fmt(project.createdAt)}</div>
          </div>
          <div className="acp-item">
            <label className="acp-label">Last Updated</label>
            <div className="acp-value">{fmt(project.updatedAt)}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminConstructionProjectDetail;