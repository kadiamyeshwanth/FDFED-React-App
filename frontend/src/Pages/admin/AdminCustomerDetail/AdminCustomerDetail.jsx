import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminCustomerDetail.css";

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // leave empty to use same origin or set VITE_API_URL

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/customer/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setCustomer(data.customer ?? data);
      } catch (err) {
        setError(err.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-customer/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Customer deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting customer: " + err.message);
    }
  };

  if (loading) return <div className="acc-loading">Loading customer…</div>;
  if (error) return <div className="acc-error">Error: {error}</div>;
  if (!customer) return <div className="acc-empty">Customer not found.</div>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not specified");
  const fmtDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not specified";

  return (
    <div className="acc-container">
      <header className="acc-header">
        <h1 className="acc-title">📋 Customer Details</h1>
        <div className="acc-actions">
          <button className="acc-btn acc-back" onClick={() => navigate("/admindashboard")}>
            ← Back to Dashboard
          </button>
          <button className="acc-btn acc-delete" onClick={handleDelete}>
            🗑️ Delete Customer
          </button>
        </div>
      </header>

      <main className="acc-card">
        <section className="acc-section acc-section-header">
          <h2 className="acc-section-title">{customer.name || "Customer"}</h2>
          <p className="acc-subtitle">Customer ID: {customer._id}</p>
        </section>

        <div className="acc-alert acc-alert-info">
          <strong>ℹ️ Account Information</strong>
          <div className="acc-alert-sub">This customer account was created on {fmtDate(customer.createdAt)}</div>
        </div>

        <h3 className="acc-section-heading">Personal Information</h3>
        <div className="acc-grid">
          <div className="acc-item">
            <label className="acc-label">Full Name</label>
            <div className="acc-value">{customer.name || "—"}</div>
          </div>

          <div className="acc-item">
            <label className="acc-label">Email Address</label>
            <div className="acc-value">{customer.email || "—"}</div>
          </div>

          <div className="acc-item">
            <label className="acc-label">Phone Number</label>
            <div className="acc-value">{customer.phone || "—"}</div>
          </div>

          <div className="acc-item">
            <label className="acc-label">Date of Birth</label>
            <div className="acc-value">{customer.dob ? fmtDate(customer.dob) : "—"}</div>
          </div>

          <div className="acc-item">
            <label className="acc-label">Role</label>
            <div className="acc-value">{customer.role || "customer"}</div>
          </div>

          <div className="acc-item">
            <label className="acc-label">Member Since</label>
            <div className="acc-value">{fmtDate(customer.createdAt)}</div>
          </div>
        </div>

        <h3 className="acc-section-heading">Account Timestamps</h3>
        <div className="acc-grid">
          <div className="acc-item">
            <label className="acc-label">Created At</label>
            <div className="acc-value">{fmtDateTime(customer.createdAt)}</div>
          </div>

          <div className="acc-item">
            <label className="acc-label">Last Updated</label>
            <div className="acc-value">{fmtDateTime(customer.updatedAt)}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCustomerDetail;