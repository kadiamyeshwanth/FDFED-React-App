import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminJobApplicationDetail.css";

const AdminJobApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // use '' or set import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/job-application/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setApplication(data.application ?? data);
      } catch (err) {
        setError(err.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this job application? This cannot be undone.")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-jobApplication/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (loading) return <div className="aja-loading">Loading application…</div>;
  if (error) return <div className="aja-error">Error: {error}</div>;
  if (!application) return <div className="aja-empty">Application not found.</div>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "Not set");
  const fmtNumber = (n) => (typeof n === "number" ? n.toLocaleString() : n ?? "N/A");

  return (
    <div className="aja-container">
      <header className="aja-header">
        <h1 className="aja-title">Job Application Details</h1>
        <div className="aja-actions">
          <button className="aja-btn aja-back" onClick={() => navigate("/admindashboard")}>← Back to Dashboard</button>
          <button className="aja-btn aja-delete" onClick={handleDelete}>🗑️ Delete</button>
        </div>
      </header>

      <main className="aja-card">
        <div className="aja-section aja-section-header">
          <h2 className="aja-section-title">
            Application for {application.positionApplying} at {application.compName}
          </h2>
          <p className="aja-subtitle">
            Application ID: {application._id} | Status: {application.status} | Applied: {fmtDate(application.createdAt)}
          </p>
        </div>

        <h3 className="aja-section-heading">Applicant Information</h3>
        <div className="aja-grid">
          <div className="aja-item">
            <label className="aja-label">Full Name</label>
            <div className="aja-value">{application.fullName}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Email</label>
            <div className="aja-value">{application.email}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Location</label>
            <div className="aja-value">{application.location}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">LinkedIn</label>
            <div className="aja-value">
              {application.linkedin ? <a href={application.linkedin} target="_blank" rel="noreferrer">{application.linkedin}</a> : "N/A"}
            </div>
          </div>
        </div>

        <h3 className="aja-section-heading">Application Details</h3>
        <div className="aja-grid">
          <div className="aja-item">
            <label className="aja-label">Experience (Years)</label>
            <div className="aja-value">{application.experience ?? "0"}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Expected Salary</label>
            <div className="aja-value">₹{fmtNumber(application.expectedSalary)}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Position Applying For</label>
            <div className="aja-value">{application.positionApplying}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Company</label>
            <div className="aja-value">{application.compName}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Terms Agreed</label>
            <div className="aja-value">{application.termsAgree ? "Yes" : "No"}</div>
          </div>
          <div className="aja-item aja-full">
            <label className="aja-label">Work Experience</label>
            <div className="aja-value">{application.workExperience || "—"}</div>
          </div>
        </div>

        <h3 className="aja-section-heading">Primary Skills</h3>
        <div className="aja-grid">
          <div className="aja-item aja-full">
            <label className="aja-label">Skills</label>
            <div className="aja-value">
              {Array.isArray(application.primarySkills) && application.primarySkills.length > 0 ? (
                <ul className="aja-skill-list">
                  {application.primarySkills.map((s, i) => <li key={i} className="aja-skill-item">{s}</li>)}
                </ul>
              ) : "None"}
            </div>
          </div>
        </div>

        <h3 className="aja-section-heading">Documents</h3>
        <div className="aja-grid">
          <div className="aja-item aja-full">
            <label className="aja-label">Resume</label>
            <div className="aja-value">
              {application.resume ? <a href={application.resume} target="_blank" rel="noreferrer">View Resume</a> : "Not provided"}
            </div>
          </div>
        </div>

        <h3 className="aja-section-heading">Timestamps</h3>
        <div className="aja-grid">
          <div className="aja-item">
            <label className="aja-label">Created At</label>
            <div className="aja-value">{fmtDateTime(application.createdAt)}</div>
          </div>
          <div className="aja-item">
            <label className="aja-label">Last Updated</label>
            <div className="aja-value">{fmtDateTime(application.updatedAt)}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminJobApplicationDetail;