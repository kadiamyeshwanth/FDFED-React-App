import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Admin.css"; // optional global admin styles if you have
import "./AdminBidDetail.css";

const AdminBidDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // leave empty to use same origin or set VITE_API_URL in env

  useEffect(() => {
    const fetchBid = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/bid/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        // backend returns { bid }
        setBid(data.bid ?? data);
      } catch (err) {
        setError(err.message || "Failed to load bid");
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bid?")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-bid/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting bid: " + err.message);
    }
  };

  if (loading) return <div className="adb-loading">Loading bid details…</div>;
  if (error) return <div className="adb-error">Error: {error}</div>;
  if (!bid) return <div className="adb-empty">Bid not found.</div>;

  const formatNumber = (n) =>
    typeof n === "number" ? n.toLocaleString() : n ?? "Not specified";

  return (
    <div className="adb-container">
      <header className="adb-header">
        <h1 className="adb-title">💰 Bid Details</h1>
        <div className="adb-actions">
          <button className="adb-btn adb-back" onClick={() => navigate("/admindashboard")}>
            ← Back to Dashboard
          </button>
          <button className="adb-btn adb-delete" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </header>

      <main className="adb-card">
        <section className="adb-section adb-section-header">
          <h2 className="adb-section-title">Construction Bid</h2>
          <p className="adb-subtitle">Bid ID: {bid._id}</p>
        </section>

        <h3 className="adb-section-heading">Bid Status</h3>
        <div className="adb-grid">
          <div className="adb-item">
            <label className="adb-label">Status</label>
            <div className="adb-value">
              <span className={`adb-badge adb-badge-${String(bid.status).toLowerCase()}`}>{bid.status}</span>
            </div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Total Bids Received</label>
            <div className="adb-value">{(bid.companyBids || []).length} companies</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Created Date</label>
            <div className="adb-value">{new Date(bid.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Last Updated</label>
            <div className="adb-value">{new Date(bid.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        <h3 className="adb-section-heading">Customer Information</h3>
        <div className="adb-grid">
          <div className="adb-item">
            <label className="adb-label">Customer Name</label>
            <div className="adb-value">{bid.customerName ?? bid.customer?.name ?? "—"}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Email</label>
            <div className="adb-value">{bid.customerEmail ?? bid.customer?.email ?? "—"}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Phone</label>
            <div className="adb-value">{bid.customerPhone ?? bid.customer?.phone ?? "—"}</div>
          </div>
          <div className="adb-item adb-full">
            <label className="adb-label">Project Address</label>
            <div className="adb-value">{bid.projectAddress ?? "—"}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Project Location</label>
            <div className="adb-value">{bid.projectLocation ?? "—"}</div>
          </div>
        </div>

        <h3 className="adb-section-heading">Project Details</h3>
        <div className="adb-grid">
          <div className="adb-item">
            <label className="adb-label">Building Type</label>
            <div className="adb-value">{bid.buildingType ?? "—"}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Total Area</label>
            <div className="adb-value">{formatNumber(bid.totalArea)} sq ft</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Total Floors</label>
            <div className="adb-value">{bid.totalFloors ?? "—"}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Estimated Budget</label>
            <div className="adb-value">₹{formatNumber(bid.estimatedBudget)}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Project Timeline</label>
            <div className="adb-value">{bid.projectTimeline ?? "—"} months</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Accessibility Needs</label>
            <div className="adb-value">{bid.accessibilityNeeds ?? "None"}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Energy Efficiency</label>
            <div className="adb-value">{bid.energyEfficiency ?? "Standard"}</div>
          </div>

          {bid.specialRequirements && (
            <div className="adb-item adb-full">
              <label className="adb-label">Special Requirements</label>
              <div className="adb-value">{bid.specialRequirements}</div>
            </div>
          )}
        </div>

        {Array.isArray(bid.floors) && bid.floors.length > 0 && (
          <>
            <h3 className="adb-section-heading">Floor Details ({bid.floors.length})</h3>
            {bid.floors.map((f, idx) => (
              <div className="adb-floor" key={idx}>
                <strong>Floor {f.floorNumber}:</strong> {f.floorType} | {f.floorArea} sq ft
                {f.floorDescription && <div className="adb-floor-desc">{f.floorDescription}</div>}
              </div>
            ))}
          </>
        )}

        <h3 className="adb-section-heading">Company Bids ({(bid.companyBids || []).length})</h3>
        {(bid.companyBids && bid.companyBids.length > 0) ? (
          bid.companyBids.map((cb, i) => (
            <div className="adb-bid-card" key={i}>
              <h4 className="adb-bid-title">{i + 1}. {cb.companyName ?? cb.company?.companyName ?? "Company"}</h4>
              <p className="adb-bid-line"><strong>Bid Price:</strong> ₹{formatNumber(cb.bidPrice)}</p>
              <p className="adb-bid-line"><strong>Status:</strong> <span className={`adb-badge adb-badge-${String(cb.status).toLowerCase()}`}>{cb.status}</span></p>
              <p className="adb-bid-line"><strong>Bid Date:</strong> {cb.bidDate ? new Date(cb.bidDate).toLocaleDateString() : "—"}</p>
            </div>
          ))
        ) : (
          <p className="adb-empty-note">No bids received yet.</p>
        )}

        <h3 className="adb-section-heading">Timestamps</h3>
        <div className="adb-grid">
          <div className="adb-item">
            <label className="adb-label">Created At</label>
            <div className="adb-value">{new Date(bid.createdAt).toLocaleString()}</div>
          </div>
          <div className="adb-item">
            <label className="adb-label">Last Updated</label>
            <div className="adb-value">{new Date(bid.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBidDetail;