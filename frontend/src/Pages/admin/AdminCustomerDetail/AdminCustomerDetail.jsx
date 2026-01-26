import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card, Section, DataRow, ActionButton, PageHeader, Spinner,
} from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, Trash2, User, Mail, Phone, Calendar, Clock, Shield,
} from "lucide-react";
import "./AdminCustomerDetail.css";

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/customer/${id}`);
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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "Not specified";
  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not specified";

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone."))
      return;
    try {
      const res = await fetch(`/api/admin/delete-customer/${id}`, {
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

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading customer...</p></div></AdminLayout>;
  if (error) return <AdminLayout><div className="detail-error"><p>Error: {error}</p></div></AdminLayout>;
  if (!customer) return <AdminLayout><div className="detail-empty"><p>Customer not found.</p></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title={customer.name || "Customer Details"}
          subtitle={`Customer ID: ${customer._id}`}
          actions={
            <div className="detail-header-actions">
              <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
              <ActionButton label="Delete Customer" icon={Trash2} variant="danger" onClick={handleDelete} />
            </div>
          }
        />

        <div className="detail-kpi-row">
          <div className="detail-kpi-card kpi-blue">
            <User size={20} />
            <div>
              <span className="kpi-val">{customer.name || "—"}</span>
              <span className="kpi-lbl">Full Name</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-green">
            <Shield size={20} />
            <div>
              <span className="kpi-val">{customer.role || "customer"}</span>
              <span className="kpi-lbl">Role</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-purple">
            <Calendar size={20} />
            <div>
              <span className="kpi-val">{fmtDate(customer.createdAt)}</span>
              <span className="kpi-lbl">Member Since</span>
            </div>
          </div>
        </div>

        <Section title="Personal Information">
          <Card>
            <div className="detail-grid">
              <DataRow label="Full Name">{customer.name || "—"}</DataRow>
              <DataRow label="Email Address">{customer.email || "—"}</DataRow>
              <DataRow label="Phone Number">{customer.phone || "—"}</DataRow>
              <DataRow label="Date of Birth">{customer.dob ? fmtDate(customer.dob) : "—"}</DataRow>
              <DataRow label="Role">{customer.role || "customer"}</DataRow>
              <DataRow label="Member Since">{fmtDate(customer.createdAt)}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Account Timestamps">
          <Card>
            <div className="detail-grid">
              <DataRow label="Created At">{fmtDateTime(customer.createdAt)}</DataRow>
              <DataRow label="Last Updated">{fmtDateTime(customer.updatedAt)}</DataRow>
            </div>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomerDetail;
