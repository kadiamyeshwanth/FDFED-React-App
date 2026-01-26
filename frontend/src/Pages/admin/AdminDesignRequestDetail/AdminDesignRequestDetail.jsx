import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card, Section, DataRow, Badge, ActionButton, PageHeader, Spinner,
} from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, Trash2, Palette, User, Mail, Phone, MapPin, Calendar,
  Clock, Ruler, Home, PenTool, Target,
} from "lucide-react";
import "./AdminDesignRequestDetail.css";

const AdminDesignRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/design-request/${id}`);
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
    if (!window.confirm("Are you sure you want to delete this design request?"))
      return;
    try {
      const res = await fetch(`/api/admin/delete-designRequest/${id}`, {
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

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading design request...</p></div></AdminLayout>;
  if (error) return <AdminLayout><div className="detail-error"><p>Error: {error}</p></div></AdminLayout>;
  if (!request) return <AdminLayout><div className="detail-empty"><p>Design request not found.</p></div></AdminLayout>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "Not set");

  const getStatusVariant = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") return "success";
    if (s === "accepted" || s === "in-progress") return "info";
    if (s === "pending") return "warning";
    if (s === "rejected") return "danger";
    return "default";
  };

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title={request.projectName || "Design Request"}
          subtitle={`Request ID: ${request._id}`}
          actions={
            <div className="detail-header-actions">
              <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
              <ActionButton label="Delete" icon={Trash2} variant="danger" onClick={handleDelete} />
            </div>
          }
        />

        <div className="detail-kpi-row">
          <div className="detail-kpi-card kpi-purple">
            <Palette size={20} />
            <div>
              <span className="kpi-val">{request.roomType ?? "—"}</span>
              <span className="kpi-lbl">Room Type</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-blue">
            <Target size={20} />
            <div>
              <span className="kpi-val">{request.status ?? "—"}</span>
              <span className="kpi-lbl">Status</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-green">
            <Calendar size={20} />
            <div>
              <span className="kpi-val">{fmtDate(request.createdAt)}</span>
              <span className="kpi-lbl">Created</span>
            </div>
          </div>
        </div>

        <Section title="Request Status">
          <Card>
            <div className="detail-grid">
              <DataRow label="Status">
                <Badge variant={getStatusVariant(request.status)}>{request.status ?? "—"}</Badge>
              </DataRow>
              <DataRow label="Created Date">{fmtDate(request.createdAt)}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Customer Information">
          <Card>
            <div className="detail-grid">
              <DataRow label="Full Name">{request.fullName ?? request.customerId?.name ?? "—"}</DataRow>
              <DataRow label="Email">{request.email ?? request.customerId?.email ?? "—"}</DataRow>
              <DataRow label="Phone">{request.phone ?? request.customerId?.phone ?? "—"}</DataRow>
              <DataRow label="Address">{request.address ?? "—"}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Room Details">
          <Card>
            <div className="detail-grid">
              <DataRow label="Room Type">{request.roomType ?? "—"}</DataRow>
              <DataRow label="Room Size">
                {request.roomSize
                  ? `${request.roomSize.length ?? "—"} x ${request.roomSize.width ?? "—"} ${request.roomSize.unit ?? ""}`
                  : "—"}
              </DataRow>
              {request.ceilingHeight?.height && (
                <DataRow label="Ceiling Height">
                  {request.ceilingHeight.height} {request.ceilingHeight.unit ?? ""}
                </DataRow>
              )}
              {request.designPreference && (
                <DataRow label="Design Preference">{request.designPreference}</DataRow>
              )}
            </div>
          </Card>
        </Section>

        {request.projectDescription && (
          <Section title="Project Description">
            <Card>
              <div className="detail-descriptions">
                <div className="desc-block">
                  <p>{request.projectDescription}</p>
                </div>
              </div>
            </Card>
          </Section>
        )}

        {request.workerId && (
          <Section title="Assigned Worker">
            <Card>
              <div className="detail-grid">
                <DataRow label="Worker Name">{request.workerId.name ?? "—"}</DataRow>
                <DataRow label="Worker Email">{request.workerId.email ?? "—"}</DataRow>
              </div>
            </Card>
          </Section>
        )}

        <Section title="Timestamps">
          <Card>
            <div className="detail-grid">
              <DataRow label="Created At">{fmtDateTime(request.createdAt)}</DataRow>
            </div>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminDesignRequestDetail;
