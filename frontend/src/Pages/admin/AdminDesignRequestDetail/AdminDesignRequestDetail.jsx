import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminDesignRequestDetail.css";

const AdminDesignRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // leave empty for same origin or set VITE_API_URL

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/design-request/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setRequest(data.request ?? data);
      } catch (err) {
        setError(err.message || "Failed to load design request");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this design request?")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-designRequest/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting request: " + err.message);
    }
  };

  if (loading) return <div className="adr-loading">Loading design request…</div>;
  if (error) return <div className="adr-error">Error: {error}</div>;
  if (!request) return <div className="adr-empty">Design request not found.</div>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "Not set");

  return (
    <div className="adr-container">
      <header className="adr-header">
        <h1 className="adr-title">🎨 Design Request Details</h1>
        <div className="adr-actions">
          <button className="adr-btn adr-back" onClick={() => navigate("/admindashboard")}>
            ← Back to Dashboard
          </button>
          <button className="adr-btn adr-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </header>

      <main className="adr-card">
        <section className="adr-section adr-section-header">
          <h2 className="adr-section-title">{request.projectName || "Design Request"}</h2>
          <p className="adr-subtitle">Request ID: {request._id}</p>
        </section>

        <h3 className="adr-section-heading">Request Status</h3>
        <div className="adr-grid">
          <div className="adr-item">
            <label className="adr-label">Status</label>
            <div className="adr-value">
              <span className={`adr-badge adr-badge-${String(request.status ?? "").toLowerCase()}`}>
                {request.status ?? "—"}
              </span>
            </div>
          </div>

          <div className="adr-item">
            <label className="adr-label">Created Date</label>
            <div className="adr-value">{fmtDate(request.createdAt)}</div>
          </div>
        </div>

        <h3 className="adr-section-heading">Customer Information</h3>
        <div className="adr-grid">
          <div className="adr-item">
            <label className="adr-label">Full Name</label>
            <div className="adr-value">{request.fullName ?? request.customerId?.name ?? "—"}</div>
          </div>
          <div className="adr-item">
            <label className="adr-label">Email</label>
            <div className="adr-value">{request.email ?? request.customerId?.email ?? "—"}</div>
          </div>
          <div className="adr-item">
            <label className="adr-label">Phone</label>
            <div className="adr-value">{request.phone ?? request.customerId?.phone ?? "—"}</div>
          </div>
          <div className="adr-item adr-full">
            <label className="adr-label">Address</label>
            <div className="adr-value">{request.address ?? "—"}</div>
          </div>
        </div>

        <h3 className="adr-section-heading">Room Details</h3>
        <div className="adr-grid">
          <div className="adr-item">
            <label className="adr-label">Room Type</label>
            <div className="adr-value">{request.roomType ?? "—"}</div>
          </div>

          <div className="adr-item">
            <label className="adr-label">Room Size</label>
            <div className="adr-value">
              {request.roomSize
                ? `${request.roomSize.length ?? "—"} x ${request.roomSize.width ?? "—"} ${request.roomSize.unit ?? ""}`
                : "—"}
            </div>
          </div>

          {request.ceilingHeight?.height && (
            <div className="adr-item">
              <label className="adr-label">Ceiling Height</label>
              <div className="adr-value">
                {request.ceilingHeight.height} {request.ceilingHeight.unit ?? ""}
              </div>
            </div>
          )}

          {request.designPreference && (
            <div className="adr-item">
              <label className="adr-label">Design Preference</label>
              <div className="adr-value">{request.designPreference}</div>
            </div>
          )}
        </div>

        {request.projectDescription && (
          <>
            <h3 className="adr-section-heading">Project Description</h3>
            <div className="adr-grid">
              <div className="adr-item adr-full">
                <label className="adr-label">Description</label>
                <div className="adr-value">{request.projectDescription}</div>
              </div>
            </div>
          </>
        )}

        {request.workerId && (
          <>
            <h3 className="adr-section-heading">Assigned Worker</h3>
            <div className="adr-grid">
              <div className="adr-item">
                <label className="adr-label">Worker Name</label>
                <div className="adr-value">{request.workerId.name ?? "—"}</div>
              </div>
              <div className="adr-item">
                <label className="adr-label">Worker Email</label>
                <div className="adr-value">{request.workerId.email ?? "—"}</div>
              </div>
            </div>
          </>
        )}

        <h3 className="adr-section-heading">Timestamps</h3>
        <div className="adr-grid">
          <div className="adr-item">
            <label className="adr-label">Created At</label>
            <div className="adr-value">{fmtDateTime(request.createdAt)}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDesignRequestDetail;