import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card, Section, DataRow, Badge, ActionButton, PageHeader, Spinner,
} from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, Trash2, User, Mail, MapPin, Calendar, Clock,
  Briefcase, IndianRupee, FileText, ExternalLink, Award, Building2,
} from "lucide-react";
import "./AdminJobApplicationDetail.css";

const AdminJobApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/job-application/${id}`);
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
    if (!window.confirm("Delete this job application? This cannot be undone."))
      return;
    try {
      const res = await fetch(`/api/admin/delete-jobApplication/${id}`, {
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

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading application...</p></div></AdminLayout>;
  if (error) return <AdminLayout><div className="detail-error"><p>Error: {error}</p></div></AdminLayout>;
  if (!application) return <AdminLayout><div className="detail-empty"><p>Application not found.</p></div></AdminLayout>;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Not set");
  const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "Not set");
  const fmtNumber = (n) => typeof n === "number" ? n.toLocaleString() : n ?? "N/A";

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title={`${application.fullName}'s Application`}
          subtitle={`Application ID: ${application._id} | Status: ${application.status}`}
          actions={
            <div className="detail-header-actions">
              <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
              <ActionButton label="Delete" icon={Trash2} variant="danger" onClick={handleDelete} />
            </div>
          }
        />

        <div className="detail-kpi-row">
          <div className="detail-kpi-card kpi-blue">
            <Briefcase size={20} />
            <div>
              <span className="kpi-val">{application.positionApplying}</span>
              <span className="kpi-lbl">Position</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-purple">
            <Building2 size={20} />
            <div>
              <span className="kpi-val">{application.compName}</span>
              <span className="kpi-lbl">Company</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-green">
            <Award size={20} />
            <div>
              <span className="kpi-val">{application.experience ?? "0"} yrs</span>
              <span className="kpi-lbl">Experience</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-orange">
            <IndianRupee size={20} />
            <div>
              <span className="kpi-val">₹{fmtNumber(application.expectedSalary)}</span>
              <span className="kpi-lbl">Expected Salary</span>
            </div>
          </div>
        </div>

        <Section title="Applicant Information">
          <Card>
            <div className="detail-grid">
              <DataRow label="Full Name">{application.fullName}</DataRow>
              <DataRow label="Email">{application.email}</DataRow>
              <DataRow label="Location">{application.location}</DataRow>
              <DataRow label="LinkedIn">
                {application.linkedin ? (
                  <a href={application.linkedin} target="_blank" rel="noreferrer" className="detail-link">
                    <ExternalLink size={13} /> View Profile
                  </a>
                ) : "N/A"}
              </DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Application Details">
          <Card>
            <div className="detail-grid">
              <DataRow label="Experience">{application.experience ?? "0"} years</DataRow>
              <DataRow label="Expected Salary">₹{fmtNumber(application.expectedSalary)}</DataRow>
              <DataRow label="Position">{application.positionApplying}</DataRow>
              <DataRow label="Company">{application.compName}</DataRow>
              <DataRow label="Terms Agreed">
                <Badge variant={application.termsAgree ? "success" : "danger"}>
                  {application.termsAgree ? "Yes" : "No"}
                </Badge>
              </DataRow>
              <DataRow label="Work Experience">{application.workExperience || "—"}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Primary Skills">
          <Card>
            <div className="detail-tags">
              {Array.isArray(application.primarySkills) && application.primarySkills.length > 0 ? (
                application.primarySkills.map((s, i) => (
                  <Badge key={i} variant="info">{s}</Badge>
                ))
              ) : (
                <span style={{ color: "#6b7280", padding: "12px 16px" }}>None specified</span>
              )}
            </div>
          </Card>
        </Section>

        <Section title="Documents">
          <Card>
            <div className="detail-grid">
              <DataRow label="Resume">
                {application.resume ? (
                  <a href={application.resume} target="_blank" rel="noreferrer" className="detail-link">
                    <FileText size={13} /> View Resume
                  </a>
                ) : "Not provided"}
              </DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Timestamps">
          <Card>
            <div className="detail-grid">
              <DataRow label="Created At">{fmtDateTime(application.createdAt)}</DataRow>
              <DataRow label="Last Updated">{fmtDateTime(application.updatedAt)}</DataRow>
            </div>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminJobApplicationDetail;
