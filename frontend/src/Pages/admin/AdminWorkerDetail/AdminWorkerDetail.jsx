import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminWorkerDetail.css";

const AdminWorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // leave empty to use same origin or set import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/worker/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setWorker(data.worker ?? data);
      } catch (err) {
        setError(err.message || "Failed to load worker");
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this worker? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-worker/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Worker deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting worker: " + err.message);
    }
  };

  if (loading) return <div className="awd-loading">Loading worker…</div>;
  if (error) return <div className="awd-error">Error: {error}</div>;
  if (!worker) return <div className="awd-empty">Worker not found.</div>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not specified");

  return (
    <div className="awd-container">
      <header className="awd-header">
        <h1 className="awd-title">Worker Details</h1>
        <div className="awd-actions">
          <button className="awd-btn awd-back" onClick={() => navigate("/admindashboard")}>
            ← Back to Dashboard
          </button>
          <button className="awd-btn awd-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </header>

      <main className="awd-card">
        <section className="awd-section awd-section-header">
          <h2 className="awd-section-title">{worker.name || "Worker"}</h2>
          <p className="awd-subtitle">
            Worker ID: {worker._id} {worker.role ? `| Role: ${worker.role}` : ""} {worker.availability ? `| Availability: ${worker.availability}` : ""}
          </p>
        </section>

        <h3 className="awd-section-heading">Personal Information</h3>
        <div className="awd-grid">
          <div className="awd-item">
            <label className="awd-label">Email</label>
            <div className="awd-value">{worker.email || "—"}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Phone</label>
            <div className="awd-value">{worker.phone || "—"}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Date of Birth</label>
            <div className="awd-value">{worker.dob ? fmtDate(worker.dob) : "—"}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Aadhaar Number</label>
            <div className="awd-value">{worker.aadharNumber || worker.aadhaarNumber || "—"}</div>
          </div>

          {worker.profileImage && (
            <div className="awd-item awd-full">
              <label className="awd-label">Profile Image</label>
              <div className="awd-value"><img className="awd-img" src={worker.profileImage} alt="Profile" /></div>
            </div>
          )}
        </div>

        <h3 className="awd-section-heading">Professional Information</h3>
        <div className="awd-grid">
          <div className="awd-item">
            <label className="awd-label">Specialization</label>
            <div className="awd-value">{worker.specialization || "—"}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Experience (Years)</label>
            <div className="awd-value">{worker.experience ?? "—"}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Professional Title</label>
            <div className="awd-value">{worker.professionalTitle || "N/A"}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Rating</label>
            <div className="awd-value">{worker.rating ?? "—"}{worker.rating ? " / 5" : ""}</div>
          </div>

          <div className="awd-item">
            <label className="awd-label">Is Architect</label>
            <div className="awd-value">{worker.isArchitect ? "Yes" : "No"}</div>
          </div>

          <div className="awd-item awd-full">
            <label className="awd-label">About</label>
            <div className="awd-value">{worker.about || "N/A"}</div>
          </div>
        </div>

        <h3 className="awd-section-heading">Specialties & Services</h3>
        <div className="awd-grid">
          <div className="awd-item awd-full">
            <label className="awd-label">Specialties</label>
            <div className="awd-value">
              {Array.isArray(worker.specialties) && worker.specialties.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {worker.specialties.map((s, i) => <li key={i} className="awd-list-item">• {s}</li>)}
                </ul>
              ) : "None"}
            </div>
          </div>

          <div className="awd-item awd-full">
            <label className="awd-label">Services Offered</label>
            <div className="awd-value">
              {Array.isArray(worker.servicesOffered) && worker.servicesOffered.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {worker.servicesOffered.map((s, i) => <li key={i} className="awd-list-item">• {s}</li>)}
                </ul>
              ) : "None"}
            </div>
          </div>
        </div>

        <h3 className="awd-section-heading">Projects</h3>
        <div className="awd-projects-list">
          {Array.isArray(worker.projects) && worker.projects.length > 0 ? (
            worker.projects.map((p, idx) => (
              <div className="awd-project-card" key={idx}>
                <div className="awd-item">
                  <label className="awd-label">Project Name</label>
                  <div className="awd-value">{p.name || "—"}</div>
                </div>
                <div className="awd-item">
                  <label className="awd-label">Year</label>
                  <div className="awd-value">{p.year || "—"}</div>
                </div>
                <div className="awd-item">
                  <label className="awd-label">Location</label>
                  <div className="awd-value">{p.location || "—"}</div>
                </div>
                <div className="awd-item awd-full">
                  <label className="awd-label">Description</label>
                  <div className="awd-value">{p.description || "—"}</div>
                </div>
                {p.image && (
                  <div className="awd-item">
                    <label className="awd-label">Image</label>
                    <div className="awd-value"><img className="awd-img" src={p.image} alt="Project" /></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="awd-empty">No projects added.</div>
          )}
        </div>

        <h3 className="awd-section-heading">Certificates</h3>
        <div className="awd-grid">
          <div className="awd-item awd-full">
            <label className="awd-label">Certificate Files</label>
            <div className="awd-value">
              {Array.isArray(worker.certificateFiles) && worker.certificateFiles.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {worker.certificateFiles.map((f, i) => (
                    <li key={i} className="awd-list-item"><a href={f} target="_blank" rel="noreferrer">View Certificate</a></li>
                  ))}
                </ul>
              ) : "None"}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminWorkerDetail;