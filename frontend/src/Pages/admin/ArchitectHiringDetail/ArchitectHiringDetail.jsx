import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card, Section, DataRow, Badge, ActionButton, PageHeader, Spinner,
} from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, Trash2, User, Mail, Phone, MapPin, Calendar, Clock,
  Home, Compass, Ruler, Layers, PenTool, IndianRupee,
} from "lucide-react";
import "./ArchitectHiringDetail.css";

const ArchitectHiringDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hiring, setHiring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHiring = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/architect-hiring/${id}`);
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
    if (!window.confirm("Delete this architect hiring request? This cannot be undone."))
      return;
    try {
      const res = await fetch(`/api/admin/delete-architectHiring/${id}`, {
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

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading...</p></div></AdminLayout>;
  if (error) return <AdminLayout><div className="detail-error"><p>Error: {error}</p></div></AdminLayout>;
  if (!hiring) return <AdminLayout><div className="detail-empty"><p>Architect hiring not found.</p></div></AdminLayout>;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "Not specified";
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString() : "Not specified";

  const getStatusVariant = (s) => {
    const st = String(s).toLowerCase();
    if (st === "completed") return "success";
    if (st === "accepted" || st === "in-progress") return "info";
    if (st === "pending") return "warning";
    return "default";
  };

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title={hiring.projectName || "Architect Hiring"}
          subtitle={`Request ID: ${hiring._id}`}
          actions={
            <div className="detail-header-actions">
              <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
              <ActionButton label="Delete" icon={Trash2} variant="danger" onClick={handleDelete} />
            </div>
          }
        />

        <div className="detail-kpi-row">
          <div className="detail-kpi-card kpi-blue">
            <PenTool size={20} />
            <div>
              <span className="kpi-val">{hiring.designRequirements?.designType ?? "—"}</span>
              <span className="kpi-lbl">Design Type</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-green">
            <Badge variant={getStatusVariant(hiring.status)}>
              {hiring.status}
            </Badge>
            <div>
              <span className="kpi-lbl">Status</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-purple">
            <IndianRupee size={20} />
            <div>
              <span className="kpi-val">{hiring.additionalDetails?.budget ?? "N/A"}</span>
              <span className="kpi-lbl">Budget</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-orange">
            <Calendar size={20} />
            <div>
              <span className="kpi-val">{fmtDate(hiring.createdAt)}</span>
              <span className="kpi-lbl">Created</span>
            </div>
          </div>
        </div>

        <Section title="Status & Basic Info">
          <Card>
            <div className="detail-grid">
              <DataRow label="Status">
                <Badge variant={getStatusVariant(hiring.status)}>{hiring.status}</Badge>
              </DataRow>
              <DataRow label="Created Date">{fmtDate(hiring.createdAt)}</DataRow>
              <DataRow label="Budget">{hiring.additionalDetails?.budget ?? "Not specified"}</DataRow>
              <DataRow label="Target Completion">
                {hiring.additionalDetails?.completionDate
                  ? fmtDate(hiring.additionalDetails.completionDate)
                  : "Not specified"}
              </DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Customer Details">
          <Card>
            <div className="detail-grid">
              <DataRow label="Full Name">{hiring.customerDetails?.fullName ?? "—"}</DataRow>
              <DataRow label="Email">{hiring.customerDetails?.email ?? "—"}</DataRow>
              <DataRow label="Contact Number">{hiring.customerDetails?.contactNumber ?? "—"}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Customer Address">
          <Card>
            <div className="detail-grid">
              <DataRow label="Street Address">{hiring.customerAddress?.streetAddress ?? "—"}</DataRow>
              <DataRow label="City">{hiring.customerAddress?.city ?? "—"}</DataRow>
              <DataRow label="State">{hiring.customerAddress?.state ?? "—"}</DataRow>
              <DataRow label="Zip Code">{hiring.customerAddress?.zipCode ?? "—"}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Plot Information">
          <Card>
            <div className="detail-grid">
              <DataRow label="Plot Location">{hiring.plotInformation?.plotLocation ?? "—"}</DataRow>
              <DataRow label="Plot Size">{hiring.plotInformation?.plotSize ?? "—"}</DataRow>
              <DataRow label="Plot Orientation">{hiring.plotInformation?.plotOrientation ?? "—"}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Design Requirements">
          <Card>
            <div className="detail-grid">
              <DataRow label="Design Type">{hiring.designRequirements?.designType ?? "—"}</DataRow>
              <DataRow label="Architectural Style">{hiring.designRequirements?.architecturalStyle ?? "—"}</DataRow>
              <DataRow label="Number of Floors">{hiring.designRequirements?.numFloors ?? "—"}</DataRow>
              {hiring.designRequirements?.specialFeatures && (
                <DataRow label="Special Features">{hiring.designRequirements.specialFeatures}</DataRow>
              )}
            </div>
          </Card>
        </Section>

        {Array.isArray(hiring.designRequirements?.floorRequirements) &&
          hiring.designRequirements.floorRequirements.length > 0 && (
          <Section title="Floor Requirements">
            <div className="detail-items-grid">
              {hiring.designRequirements.floorRequirements.map((floor, i) => (
                <Card key={i} className="detail-floor-card">
                  <div className="floor-header">
                    <Badge variant="info">Floor {floor.floorNumber}</Badge>
                  </div>
                  <p className="floor-desc">{floor.details || "No details provided"}</p>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {hiring.worker && (
          <Section title="Assigned Worker">
            <Card>
              <div className="detail-grid">
                <DataRow label="Worker Name">{hiring.worker.name}</DataRow>
                <DataRow label="Worker Email">{hiring.worker.email}</DataRow>
              </div>
            </Card>
          </Section>
        )}

        <Section title="Timestamps">
          <Card>
            <div className="detail-grid">
              <DataRow label="Created At">{fmtDateTime(hiring.createdAt)}</DataRow>
              <DataRow label="Last Updated">{fmtDateTime(hiring.updatedAt)}</DataRow>
            </div>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default ArchitectHiringDetail;
