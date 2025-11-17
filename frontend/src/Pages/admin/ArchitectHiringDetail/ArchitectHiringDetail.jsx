import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ArchitectHiringDetail.css";

const ArchitectHiringDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiring, setHiring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // leave empty for same origin or set import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchHiring = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/architect-hiring/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const json = await res.json();
        setHiring(json.hiring ?? json);
      } catch (err) {
        setError(err.message || "Failed to load hiring");
      } finally {
        setLoading(false);
      }
    };
    fetchHiring();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this architect hiring request? This cannot be undone.")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-architectHiring/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      alert(json.message || "Deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (loading) return <div className="ahd-loading">Loading architect hiring…</div>;
  if (error) return <div className="ahd-error">Error: {error}</div>;
  if (!hiring) return <div className="ahd-empty">Architect hiring not found.</div>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not specified");
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "Not specified");

  return (
    <div className="ahd-container">
      <header className="ahd-header">
        <h1 className="ahd-title">🏗️ Architect Hiring Details</h1>
        <div className="ahd-actions">
          <button className="ahd-btn ahd-back" onClick={() => navigate("/admindashboard")}>← Back to Dashboard</button>
          <button className="ahd-btn ahd-delete" onClick={handleDelete}>🗑️ Delete</button>
        </div>
      </header>

      <main className="ahd-card">
        <section className="ahd-section-header">
          <h2 className="ahd-section-title">{hiring.projectName || "Project"}</h2>
          <p className="ahd-subtitle">Request ID: {hiring._id}</p>
        </section>

        <h3 className="ahd-section-heading">Status & Basic Info</h3>
        <div className="ahd-grid">
          <div className="ahd-item">
            <label className="ahd-label">Status</label>
            <div className="ahd-value"><span className={`ahd-badge ${String(hiring.status)}`}>{hiring.status}</span></div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Created Date</label>
            <div className="ahd-value">{fmtDate(hiring.createdAt)}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Budget</label>
            <div className="ahd-value">{hiring.additionalDetails?.budget ?? "Not specified"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Target Completion</label>
            <div className="ahd-value">{hiring.additionalDetails?.completionDate ? fmtDate(hiring.additionalDetails.completionDate) : "Not specified"}</div>
          </div>
        </div>

        <h3 className="ahd-section-heading">Customer Details</h3>
        <div className="ahd-grid">
          <div className="ahd-item">
            <label className="ahd-label">Full Name</label>
            <div className="ahd-value">{hiring.customerDetails?.fullName ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Email</label>
            <div className="ahd-value">{hiring.customerDetails?.email ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Contact Number</label>
            <div className="ahd-value">{hiring.customerDetails?.contactNumber ?? "—"}</div>
          </div>
        </div>

        <h3 className="ahd-section-heading">Customer Address</h3>
        <div className="ahd-grid">
          <div className="ahd-item">
            <label className="ahd-label">Street Address</label>
            <div className="ahd-value">{hiring.customerAddress?.streetAddress ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">City</label>
            <div className="ahd-value">{hiring.customerAddress?.city ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">State</label>
            <div className="ahd-value">{hiring.customerAddress?.state ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Zip Code</label>
            <div className="ahd-value">{hiring.customerAddress?.zipCode ?? "—"}</div>
          </div>
        </div>

        <h3 className="ahd-section-heading">Plot Information</h3>
        <div className="ahd-grid">
          <div className="ahd-item">
            <label className="ahd-label">Plot Location</label>
            <div className="ahd-value">{hiring.plotInformation?.plotLocation ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Plot Size</label>
            <div className="ahd-value">{hiring.plotInformation?.plotSize ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Plot Orientation</label>
            <div className="ahd-value">{hiring.plotInformation?.plotOrientation ?? "—"}</div>
          </div>
        </div>

        <h3 className="ahd-section-heading">Design Requirements</h3>
        <div className="ahd-grid">
          <div className="ahd-item">
            <label className="ahd-label">Design Type</label>
            <div className="ahd-value">{hiring.designRequirements?.designType ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Architectural Style</label>
            <div className="ahd-value">{hiring.designRequirements?.architecturalStyle ?? "—"}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Number of Floors</label>
            <div className="ahd-value">{hiring.designRequirements?.numFloors ?? "—"}</div>
          </div>
          {hiring.designRequirements?.specialFeatures && (
            <div className="ahd-item ahd-full">
              <label className="ahd-label">Special Features</label>
              <div className="ahd-value">{hiring.designRequirements.specialFeatures}</div>
            </div>
          )}
        </div>

        {Array.isArray(hiring.designRequirements?.floorRequirements) && hiring.designRequirements.floorRequirements.length > 0 && (
          <>
            <h3 className="ahd-section-heading">Floor Requirements</h3>
            {hiring.designRequirements.floorRequirements.map((floor, i) => (
              <div className="ahd-floor-card" key={i}>
                <strong>Floor {floor.floorNumber}:</strong> {floor.details || "No details provided"}
              </div>
            ))}
          </>
        )}

        {hiring.worker && (
          <>
            <h3 className="ahd-section-heading">Assigned Worker</h3>
            <div className="ahd-grid">
              <div className="ahd-item">
                <label className="ahd-label">Worker Name</label>
                <div className="ahd-value">{hiring.worker.name}</div>
              </div>
              <div className="ahd-item">
                <label className="ahd-label">Worker Email</label>
                <div className="ahd-value">{hiring.worker.email}</div>
              </div>
            </div>
          </>
        )}

        <h3 className="ahd-section-heading">Timestamps</h3>
        <div className="ahd-grid">
          <div className="ahd-item">
            <label className="ahd-label">Created At</label>
            <div className="ahd-value">{fmtDateTime(hiring.createdAt)}</div>
          </div>
          <div className="ahd-item">
            <label className="ahd-label">Last Updated</label>
            <div className="ahd-value">{fmtDateTime(hiring.updatedAt)}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchitectHiringDetail;