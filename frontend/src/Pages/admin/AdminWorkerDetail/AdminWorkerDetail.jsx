import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Star } from "lucide-react";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card,
  PageHeader,
  Section,
  DataRow,
  Badge,
  ActionButton,
  Spinner,
  KPICard,
} from "../../../components/admin/AdminUIComponents";
import "./AdminWorkerDetail.css";

const AdminWorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/worker/${id}`);
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
    if (
      !window.confirm(
        "Are you sure you want to delete this worker? This action cannot be undone."
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/delete-worker/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Worker deleted");
      navigate("/admin/admindashboard");
    } catch (err) {
      alert("Error deleting worker: " + err.message);
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString() : "Not specified";

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <Spinner size="lg" />
          <p>Loading worker details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-container">
          <h2>Error Loading Worker</h2>
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!worker) {
    return (
      <AdminLayout>
        <div className="error-container">
          <h2>Worker Not Found</h2>
          <ActionButton
            label="Back to Dashboard"
            variant="primary"
            onClick={() => navigate("/admin/admindashboard")}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="detail-page">
        {/* Page Header */}
        <PageHeader
          title={worker.name || "Worker"}
          subtitle={`Worker ID: ${worker._id}`}
          actions={
            <div className="header-actions">
              <ActionButton
                label="Back"
                icon={ArrowLeft}
                variant="secondary"
                onClick={() => navigate("/admin/admindashboard")}
              />
              <ActionButton
                label="Delete"
                icon={Trash2}
                variant="danger"
                onClick={handleDelete}
              />
            </div>
          }
        />

        {/* Worker Overview */}
        <Section title="Worker Overview">
          <div className="overview-grid">
            <KPICard
              title="Rating"
              value={Number(worker.rating || 0).toFixed(1)}
              unit="⭐"
              icon={Star}
              color="orange"
            />
            <KPICard
              title="Experience"
              value={worker.experience || 0}
              unit="years"
              color="blue"
            />
            {worker.isArchitect && (
              <Card style={{ padding: "16px" }}>
                <Badge variant="primary">Architect</Badge>
              </Card>
            )}
          </div>
        </Section>

        {/* Personal Information */}
        <Section title="Personal Information">
          <Card>
            <DataRow label="Email">{worker.email || "—"}</DataRow>
            <DataRow label="Phone">{worker.phone || "—"}</DataRow>
            <DataRow label="Date of Birth">{fmtDate(worker.dob)}</DataRow>
            <DataRow label="Address">
              {worker.address || "—"}
            </DataRow>
            <DataRow label="City">
              {worker.city || "—"}
            </DataRow>
          </Card>
        </Section>

        {/* Professional Information */}
        <Section title="Professional Information">
          <Card>
            <DataRow label="Specialization">
              {worker.specialization || "—"}
            </DataRow>
            <DataRow label="Availability">
              <Badge variant={worker.availability || "unavailable"}>
                {worker.availability || "Unavailable"}
              </Badge>
            </DataRow>
            <DataRow label="Status">
              <Badge variant={worker.status || "pending"}>
                {worker.status || "Pending"}
              </Badge>
            </DataRow>
            {worker.bio && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0" }}>
                  BIO
                </p>
                <p style={{ fontSize: "14px", color: "#1f2937", lineHeight: "1.6", margin: "0" }}>
                  {worker.bio}
                </p>
              </div>
            )}
          </Card>
        </Section>

        {/* Skills and Certifications */}
        <Section title="Skills & Certifications">
          <div className="skills-grid">
            {worker.skills && worker.skills.length > 0 ? (
              worker.skills.map((skill, i) => (
                <Card key={i} style={{ padding: "12px" }}>
                  <p style={{ margin: "0", color: "#1f2937", fontWeight: "600" }}>
                    {skill}
                  </p>
                </Card>
              ))
            ) : (
              <Card style={{ padding: "16px", textAlign: "center" }}>
                <p style={{ color: "#6b7280", margin: "0" }}>No skills listed</p>
              </Card>
            )}
          </div>
        </Section>

        {/* Documents and Media */}
        {(worker.profileImage || worker.documents) && (
          <Section title="Documents">
            <div className="documents-grid">
              {worker.profileImage && (
                <Card style={{ padding: "16px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0" }}>
                    PROFILE IMAGE
                  </p>
                  <img
                    src={worker.profileImage}
                    alt="Profile"
                    style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "200px" }}
                  />
                </Card>
              )}
              {worker.documents && Array.isArray(worker.documents) && worker.documents.length > 0 && (
                <Card style={{ padding: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 12px 0" }}>
                    DOCUMENTS ({worker.documents.length})
                  </p>
                  {worker.documents.map((doc, i) => (
                    <div key={i} style={{ marginBottom: "8px" }}>
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#3b82f6",
                          textDecoration: "none",
                          fontSize: "13px",
                          wordBreak: "break-all",
                        }}
                      >
                        Document {i + 1}
                      </a>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </Section>
        )}

        {/* Projects Worked On */}
        {worker.projectsWorked && worker.projectsWorked.length > 0 && (
          <Section title={`Projects Worked On (${worker.projectsWorked.length})`}>
            <div className="projects-grid">
              {worker.projectsWorked.map((project, i) => (
                <Card key={i} style={{ padding: "16px" }}>
                  <h4 style={{ marginTop: "0", color: "#1f2937" }}>
                    {project.name || project.projectName || "Project"}
                  </h4>
                  <DataRow label="Status">
                    <Badge variant={project.status || "completed"}>
                      {project.status || "Completed"}
                    </Badge>
                  </DataRow>
                  {project.description && (
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
                      {project.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Reviews */}
        {worker.reviews && worker.reviews.length > 0 && (
          <Section title={`Reviews (${worker.reviews.length})`}>
            <div className="reviews-grid">
              {worker.reviews.map((review, i) => (
                <Card key={i} style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <h4 style={{ margin: "0", color: "#1f2937" }}>
                      {review.reviewer || "Anonymous"}
                    </h4>
                    <span style={{ color: "#f59e0b" }}>⭐ {review.rating || 0}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "0", lineHeight: "1.5" }}>
                    {review.comment || "No comment"}
                  </p>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Timestamps */}
        <Section title="Timestamps">
          <Card>
            <DataRow label="Created At">
              {new Date(worker.createdAt).toLocaleString()}
            </DataRow>
            <DataRow label="Last Updated">
              {new Date(worker.updatedAt).toLocaleString()}
            </DataRow>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminWorkerDetail;
