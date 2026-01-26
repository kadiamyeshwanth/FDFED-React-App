import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card, Section, DataRow, Badge, ActionButton, PageHeader, Spinner,
} from "../../../components/admin/AdminUIComponents";
import {
  ArrowLeft, Trash2, Building2, Mail, Phone, MapPin, Calendar, Users,
  Briefcase, Clock, Globe, FileText,
} from "lucide-react";
import "./AdminCompanyDetail.css";

const AdminCompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/company/${id}`);
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
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone."))
      return;
    try {
      const res = await fetch(`/api/admin/delete-company/${id}`, {
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

  if (loading) return <AdminLayout><div className="detail-loading"><Spinner size="lg" /><p>Loading company...</p></div></AdminLayout>;
  if (error) return <AdminLayout><div className="detail-error"><p>Error: {error}</p></div></AdminLayout>;
  if (!company) return <AdminLayout><div className="detail-empty"><p>Company not found.</p></div></AdminLayout>;

  const fmt = (date, opts) =>
    date ? new Date(date).toLocaleString("en-US", opts) : "Not specified";

  return (
    <AdminLayout>
      <div className="admin-detail-page">
        <PageHeader
          title={company.companyName || "Company Details"}
          subtitle={`Company ID: ${company._id}`}
          actions={
            <div className="detail-header-actions">
              <ActionButton label="Back to Dashboard" icon={ArrowLeft} variant="secondary" onClick={() => navigate("/admin/admindashboard")} />
              <ActionButton label="Delete Company" icon={Trash2} variant="danger" onClick={handleDelete} />
            </div>
          }
        />

        <div className="detail-kpi-row">
          <div className="detail-kpi-card kpi-blue">
            <Briefcase size={20} />
            <div>
              <span className="kpi-val">{company.projectsCompleted ?? "0"}</span>
              <span className="kpi-lbl">Projects Done</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-purple">
            <Clock size={20} />
            <div>
              <span className="kpi-val">{company.yearsInBusiness || "N/A"}</span>
              <span className="kpi-lbl">Years Active</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-green">
            <Users size={20} />
            <div>
              <span className="kpi-val">{company.size || "N/A"}</span>
              <span className="kpi-lbl">Team Size</span>
            </div>
          </div>
          <div className="detail-kpi-card kpi-orange">
            <Calendar size={20} />
            <div>
              <span className="kpi-val">{fmt(company.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="kpi-lbl">Registered</span>
            </div>
          </div>
        </div>

        <Section title="Basic Information">
          <Card>
            <div className="detail-grid">
              <DataRow label="Company Name">{company.companyName || "—"}</DataRow>
              <DataRow label="Contact Person">{company.contactPerson || "—"}</DataRow>
              <DataRow label="Email Address">{company.email || "—"}</DataRow>
              <DataRow label="Phone Number">{company.phone || "—"}</DataRow>
              <DataRow label="Company Size">{company.size || "Not specified"}</DataRow>
              <DataRow label="Projects Completed">{company.projectsCompleted ?? "0"}</DataRow>
              <DataRow label="Years in Business">{company.yearsInBusiness || "Not specified"}</DataRow>
              <DataRow label="Profile Type">{company.profileType || "company"}</DataRow>
            </div>
          </Card>
        </Section>

        <Section title="Location">
          <Card>
            <div className="detail-grid">
              <DataRow label="Address">{company.location?.address || "Not provided"}</DataRow>
              <DataRow label="City">{company.location?.city || "Not specified"}</DataRow>
              <DataRow label="State">{company.location?.state || "Not specified"}</DataRow>
              <DataRow label="Country">{company.location?.country || "Not specified"}</DataRow>
              <DataRow label="Postal Code">{company.location?.postalCode || "Not specified"}</DataRow>
            </div>
          </Card>
        </Section>

        {(company.description || company.aboutCompany || company.aboutForCustomers || company.whyJoinUs || company.didYouKnow) && (
          <Section title="Company Description">
            <Card>
              <div className="detail-descriptions">
                {company.description && (
                  <div className="desc-block"><h4>Description</h4><p>{company.description}</p></div>
                )}
                {company.aboutCompany && (
                  <div className="desc-block"><h4>About Company</h4><p>{company.aboutCompany}</p></div>
                )}
                {company.aboutForCustomers && (
                  <div className="desc-block"><h4>About for Customers</h4><p>{company.aboutForCustomers}</p></div>
                )}
                {company.whyJoinUs && (
                  <div className="desc-block"><h4>Why Join Us</h4><p>{company.whyJoinUs}</p></div>
                )}
                {company.didYouKnow && (
                  <div className="desc-block"><h4>Did You Know</h4><p>{company.didYouKnow}</p></div>
                )}
              </div>
            </Card>
          </Section>
        )}

        {Array.isArray(company.specialization) && company.specialization.length > 0 && (
          <Section title="Specializations">
            <Card>
              <div className="detail-tags">
                {company.specialization.map((s, i) => (
                  <Badge key={i} variant="info">{s}</Badge>
                ))}
              </div>
            </Card>
          </Section>
        )}

        {Array.isArray(company.currentOpenings) && company.currentOpenings.length > 0 && (
          <Section title="Current Openings">
            <Card>
              <div className="detail-tags">
                {company.currentOpenings.map((o, i) => (
                  <Badge key={i} variant="success">{o}</Badge>
                ))}
              </div>
            </Card>
          </Section>
        )}

        <Section title="Account Timestamps">
          <Card>
            <div className="detail-grid">
              <DataRow label="Created At">
                {fmt(company.createdAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </DataRow>
              <DataRow label="Last Updated">
                {fmt(company.updatedAt, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </DataRow>
            </div>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanyDetail;
