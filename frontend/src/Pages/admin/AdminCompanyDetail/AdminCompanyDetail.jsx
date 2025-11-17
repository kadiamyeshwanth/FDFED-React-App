import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Admin.css";
import "./AdminCompanyDetail.css";

const AdminCompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ""; // set to '' or use import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/admin/company/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setCompany(data.company ?? data);
      } catch (err) {
        setError(err.message || "Failed to load company");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-company/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Company deleted");
      navigate("/admindashboard");
    } catch (err) {
      alert("Error deleting company: " + err.message);
    }
  };

  if (loading) return <div className="acd-loading">Loading company…</div>;
  if (error) return <div className="acd-error">Error: {error}</div>;
  if (!company) return <div className="acd-empty">Company not found.</div>;

  const fmt = (date, opts) =>
    date ? new Date(date).toLocaleString("en-US", opts) : "Not specified";

  return (
    <div className="acd-container">
      <header className="acd-header">
        <h1 className="acd-title">🏢 Company Details</h1>
        <div className="acd-actions">
          <button className="acd-btn acd-back" onClick={() => navigate("/admindashboard")}>
            ← Back to Dashboard
          </button>
          <button className="acd-btn acd-delete" onClick={handleDelete}>
            🗑️ Delete Company
          </button>
        </div>
      </header>

      <main className="acd-card">
        <div className="acd-section acd-section-header">
          <h2 className="acd-section-title">{company.companyName || "Company"}</h2>
          <p className="acd-subtitle">Company ID: {company._id}</p>
        </div>

        <div className="acd-alert acd-alert-info">
          <strong>ℹ️ Company Information</strong>
          <div className="acd-alert-sub">
            Registered on {fmt(company.createdAt, { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        <h3 className="acd-section-heading">Basic Information</h3>
        <div className="acd-grid">
          <div className="acd-item">
            <label className="acd-label">Company Name</label>
            <div className="acd-value">{company.companyName || "—"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Contact Person</label>
            <div className="acd-value">{company.contactPerson || "—"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Email Address</label>
            <div className="acd-value">{company.email || "—"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Phone Number</label>
            <div className="acd-value">{company.phone || "—"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Company Size</label>
            <div className="acd-value">{company.size || "Not specified"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Projects Completed</label>
            <div className="acd-value">{company.projectsCompleted ?? "0"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Years in Business</label>
            <div className="acd-value">{company.yearsInBusiness || "Not specified"}</div>
          </div>

          <div className="acd-item">
            <label className="acd-label">Profile Type</label>
            <div className="acd-value">{company.profileType || "company"}</div>
          </div>
        </div>

        <h3 className="acd-section-heading">Location</h3>
        <div className="acd-grid">
          <div className="acd-item">
            <label className="acd-label">Address</label>
            <div className="acd-value">{company.location?.address || "Not provided"}</div>
          </div>
          <div className="acd-item">
            <label className="acd-label">City</label>
            <div className="acd-value">{company.location?.city || "Not specified"}</div>
          </div>
          <div className="acd-item">
            <label className="acd-label">State</label>
            <div className="acd-value">{company.location?.state || "Not specified"}</div>
          </div>
          <div className="acd-item">
            <label className="acd-label">Country</label>
            <div className="acd-value">{company.location?.country || "Not specified"}</div>
          </div>
          <div className="acd-item">
            <label className="acd-label">Postal Code</label>
            <div className="acd-value">{company.location?.postalCode || "Not specified"}</div>
          </div>
        </div>

        {(company.description || company.aboutCompany || company.aboutForCustomers || company.whyJoinUs || company.didYouKnow) && (
          <>
            <h3 className="acd-section-heading">Company Description</h3>
            <div className="acd-grid">
              {company.description && (
                <div className="acd-item acd-full">
                  <label className="acd-label">Description</label>
                  <div className="acd-value">{company.description}</div>
                </div>
              )}
              {company.aboutCompany && (
                <div className="acd-item acd-full">
                  <label className="acd-label">About Company</label>
                  <div className="acd-value">{company.aboutCompany}</div>
                </div>
              )}
              {company.aboutForCustomers && (
                <div className="acd-item acd-full">
                  <label className="acd-label">About for Customers</label>
                  <div className="acd-value">{company.aboutForCustomers}</div>
                </div>
              )}
              {company.whyJoinUs && (
                <div className="acd-item acd-full">
                  <label className="acd-label">Why Join Us</label>
                  <div className="acd-value">{company.whyJoinUs}</div>
                </div>
              )}
              {company.didYouKnow && (
                <div className="acd-item acd-full">
                  <label className="acd-label">Did You Know</label>
                  <div className="acd-value">{company.didYouKnow}</div>
                </div>
              )}
            </div>
          </>
        )}

        {Array.isArray(company.specialization) && company.specialization.length > 0 && (
          <>
            <h3 className="acd-section-heading">Specializations</h3>
            <div className="acd-list">
              {company.specialization.map((s, i) => (
                <div className="acd-list-item" key={i}>• {s}</div>
              ))}
            </div>
          </>
        )}

        {Array.isArray(company.currentOpenings) && company.currentOpenings.length > 0 && (
          <>
            <h3 className="acd-section-heading">Current Openings</h3>
            <div className="acd-list">
              {company.currentOpenings.map((o, i) => (
                <div className="acd-list-item" key={i}>• {o}</div>
              ))}
            </div>
          </>
        )}

        <h3 className="acd-section-heading">Account Timestamps</h3>
        <div className="acd-grid">
          <div className="acd-item">
            <label className="acd-label">Created At</label>
            <div className="acd-value">
              {fmt(company.createdAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div className="acd-item">
            <label className="acd-label">Last Updated</label>
            <div className="acd-value">
              {fmt(company.updatedAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCompanyDetail;