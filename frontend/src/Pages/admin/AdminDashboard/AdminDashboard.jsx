import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  BarChart3,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  StatCard,
  PageHeader,
  Section,
  AdminTable,
  Spinner,
  ActionButton,
  Badge,
} from "../../../components/admin/AdminUIComponents";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    counts: { customers: 0, companies: 0, workers: 0 },
    stats: { activeProjects: 0, pendingRequests: 0, openBids: 0 },
    data: {
      customers: [],
      companies: [],
      workers: [],
      architectHirings: [],
      constructionProjects: [],
      designRequests: [],
      bids: [],
      jobApplications: [],
    },
  });

  const [activeTab, setActiveTab] = useState("customers");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unviewedComplaints, setUnviewedComplaints] = useState({});

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admindashboard`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);

      try {
        const complaintsRes = await fetch(
          `/api/complaints/unviewed/count`,
          {
            credentials: "include",
          }
        );
        const complaintsData = await complaintsRes.json();
        if (complaintsData.success) {
          const complaintsMap = {};
          complaintsData.unviewedByProject.forEach((item) => {
            complaintsMap[item._id] = item.count;
          });
          setUnviewedComplaints(complaintsMap);
        }
      } catch (err) {
        console.error("Error fetching unviewed complaints:", err);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDelete = async (type, id) => {
    if (
      !window.confirm(`Are you sure you want to delete this ${type}?`)
    )
      return;
    try {
      const res = await fetch(`/api/admin/delete-${type}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await fetchDashboard();
      alert(json.message || "Deleted");
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const handleVerifyReject = async (type, id, action) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action} this ${type}?`
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/${action}-${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `${action} failed`);
      await fetchDashboard();
      alert(json.message || `${action.charAt(0).toUpperCase() + action.slice(1)}d`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const tabData = useMemo(() => {
    const d = data.data;
    switch (activeTab) {
      case "customers":
        return d.customers || [];
      case "companies":
        return d.companies || [];
      case "workers":
        return d.workers || [];
      case "architect-hirings":
        return d.architectHirings || [];
      case "construction-projects":
        return d.constructionProjects || [];
      case "design-requests":
        return d.designRequests || [];
      case "bids":
        return d.bids || [];
      case "job-applications":
        return d.jobApplications || [];
      default:
        return [];
    }
  }, [activeTab, data]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(tabData)) return [];
    const q = search.trim().toLowerCase();
    return tabData.filter((item) => {
      if (statusFilter !== "all") {
        const s = (item.status || item.availability || "").toString();
        if (s.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      return JSON.stringify(item).toLowerCase().includes(q);
    });
  }, [tabData, search, statusFilter]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <Spinner size="lg" />
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <ActionButton
            label="Retry"
            variant="primary"
            onClick={fetchDashboard}
          />
        </div>
      </AdminLayout>
    );
  }

  const { counts, stats } = data;
  const hasPendingCompanies = (data.data.companies || []).some(
    (c) => c.status === "pending"
  );
  const hasPendingWorkers = (data.data.workers || []).some(
    (w) => w.status === "pending"
  );

  const renderTableByTab = () => {
    switch (activeTab) {
      case "customers":
        return (
          <AdminTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              {
                key: "dob",
                label: "DOB",
                render: (row) =>
                  row.dob ? new Date(row.dob).toLocaleDateString() : "—",
              },
              {
                key: "createdAt",
                label: "Joined",
                render: (row) =>
                  row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—",
              },
            ]}
            data={filteredData}
            actions={[
              {
                variant: "view",
                label: "View",
                icon: Eye,
                onClick: (row) => navigate(`/admin/customer/${row._id}`),
              },
              {
                variant: "delete",
                label: "Delete",
                icon: Trash2,
                onClick: (row) => handleDelete("customer", row._id),
              },
            ]}
          />
        );

      case "companies":
        const companyActions = [
          {
            variant: "view",
            label: "View",
            icon: Eye,
            onClick: (row) => navigate(`/admin/company/${row._id}`),
          },
        ];
        if (hasPendingCompanies) {
          companyActions.push(
            {
              variant: "success",
              label: "Verify",
              icon: CheckCircle,
              onClick: (row) =>
                handleVerifyReject("company", row._id, "verify"),
            },
            {
              variant: "delete",
              label: "Reject",
              icon: XCircle,
              onClick: (row) =>
                handleVerifyReject("company", row._id, "reject"),
            }
          );
        }
        companyActions.push({
          variant: "delete",
          label: "Delete",
          icon: Trash2,
          onClick: (row) => handleDelete("company", row._id),
        });
        return (
          <AdminTable
            columns={[
              { key: "companyName", label: "Company" },
              { key: "contactPerson", label: "Contact" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              {
                key: "location",
                label: "Location",
                render: (row) => row.location?.city || "N/A",
              },
              { key: "size", label: "Size" },
              {
                key: "projectsCompleted",
                label: "Projects",
                render: (row) => row.projectsCompleted || 0,
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
              },
            ]}
            data={filteredData}
            actions={companyActions}
          />
        );

      case "workers":
        const workerActions = [
          {
            variant: "view",
            label: "View",
            icon: Eye,
            onClick: (row) => navigate(`/admin/worker/${row._id}`),
          },
        ];
        if (hasPendingWorkers) {
          workerActions.push(
            {
              variant: "success",
              label: "Verify",
              icon: CheckCircle,
              onClick: (row) =>
                handleVerifyReject("worker", row._id, "verify"),
            },
            {
              variant: "delete",
              label: "Reject",
              icon: XCircle,
              onClick: (row) =>
                handleVerifyReject("worker", row._id, "reject"),
            }
          );
        }
        workerActions.push({
          variant: "delete",
          label: "Delete",
          icon: Trash2,
          onClick: (row) => handleDelete("worker", row._id),
        });
        return (
          <AdminTable
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "specialization", label: "Specialization" },
              {
                key: "experience",
                label: "Exp",
                render: (row) => `${row.experience || 0} yrs`,
              },
              {
                key: "rating",
                label: "Rating",
                render: (row) => `⭐ ${Number(row.rating || 0).toFixed(1)}`,
              },
              {
                key: "availability",
                label: "Availability",
                render: (row) => <Badge variant={row.availability}>{row.availability}</Badge>,
              },
              {
                key: "isArchitect",
                label: "Architect",
                render: (row) => (row.isArchitect ? "Yes" : "No"),
              },
            ]}
            data={filteredData}
            actions={workerActions}
          />
        );

      case "architect-hirings":
        return (
          <AdminTable
            columns={[
              { key: "projectName", label: "Project" },
              {
                key: "customer",
                label: "Customer",
                render: (row) =>
                  row.customer?.name ||
                  row.customerDetails?.fullName ||
                  "—",
              },
              {
                key: "designType",
                label: "Type",
                render: (row) =>
                  row.designRequirements?.designType || "—",
              },
              {
                key: "plotSize",
                label: "Size",
                render: (row) =>
                  row.plotInformation?.plotSize || "—",
              },
              {
                key: "budget",
                label: "Budget",
                render: (row) =>
                  row.additionalDetails?.budget ?? "N/A",
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
              },
              {
                key: "createdAt",
                label: "Created",
                render: (row) =>
                  row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—",
              },
            ]}
            data={filteredData}
            actions={[
              {
                variant: "view",
                label: "View",
                icon: Eye,
                onClick: (row) =>
                  navigate(`/admin/architect-hiring/${row._id}`),
              },
              {
                variant: "delete",
                label: "Delete",
                icon: Trash2,
                onClick: (row) =>
                  handleDelete("architectHiring", row._id),
              },
            ]}
          />
        );

      case "construction-projects":
        return (
          <AdminTable
            columns={[
              {
                key: "projectName",
                label: "Project",
                render: (row) => (
                  <div>
                    {row.projectName}
                    {unviewedComplaints[row._id] && (
                      <span className="complaint-badge">
                        {unviewedComplaints[row._id]}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: "customerName",
                label: "Customer",
                render: (row) =>
                  row.customerName || row.customerId?.name,
              },
              { key: "buildingType", label: "Type" },
              {
                key: "totalArea",
                label: "Area",
                render: (row) => `${row.totalArea} sq ft`,
              },
              {
                key: "estimatedBudget",
                label: "Budget",
                render: (row) =>
                  `₹${row.estimatedBudget?.toLocaleString() || "N/A"}`,
              },
              {
                key: "completionPercentage",
                label: "Progress",
                render: (row) =>
                  `${row.completionPercentage || 0}%`,
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
              },
            ]}
            data={filteredData}
            actions={[
              {
                variant: "view",
                label: "View",
                icon: Eye,
                onClick: (row) =>
                  navigate(`/admin/construction-project/${row._id}`),
              },
              {
                variant: "delete",
                label: "Delete",
                icon: Trash2,
                onClick: (row) =>
                  handleDelete("constructionProject", row._id),
              },
            ]}
          />
        );

      case "design-requests":
        return (
          <AdminTable
            columns={[
              { key: "projectName", label: "Project" },
              {
                key: "fullName",
                label: "Customer",
                render: (row) =>
                  row.fullName || row.customerId?.name,
              },
              { key: "roomType", label: "Room Type" },
              {
                key: "roomSize",
                label: "Size",
                render: (row) =>
                  row.roomSize
                    ? `${row.roomSize.length}x${row.roomSize.width}`
                    : "—",
              },
              {
                key: "designPreference",
                label: "Preference",
                render: (row) =>
                  row.designPreference || "N/A",
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
              },
              {
                key: "createdAt",
                label: "Created",
                render: (row) =>
                  row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—",
              },
            ]}
            data={filteredData}
            actions={[
              {
                variant: "view",
                label: "View",
                icon: Eye,
                onClick: (row) =>
                  navigate(`/admin/design-request/${row._id}`),
              },
              {
                variant: "delete",
                label: "Delete",
                icon: Trash2,
                onClick: (row) =>
                  handleDelete("designRequest", row._id),
              },
            ]}
          />
        );

      case "bids":
        return (
          <AdminTable
            columns={[
              { key: "customerName", label: "Customer" },
              { key: "buildingType", label: "Type" },
              {
                key: "totalArea",
                label: "Area",
                render: (row) => `${row.totalArea} sq ft`,
              },
              {
                key: "estimatedBudget",
                label: "Budget",
                render: (row) =>
                  `₹${row.estimatedBudget?.toLocaleString() || "N/A"}`,
              },
              {
                key: "companyBids",
                label: "Bids",
                render: (row) => row.companyBids?.length || 0,
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
              },
              {
                key: "createdAt",
                label: "Created",
                render: (row) =>
                  row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—",
              },
            ]}
            data={filteredData}
            actions={[
              {
                variant: "view",
                label: "View",
                icon: Eye,
                onClick: (row) =>
                  navigate(`/admin/bid/${row._id}`),
              },
              {
                variant: "delete",
                label: "Delete",
                icon: Trash2,
                onClick: (row) =>
                  handleDelete("bid", row._id),
              },
            ]}
          />
        );

      case "job-applications":
        return (
          <AdminTable
            columns={[
              { key: "fullName", label: "Applicant" },
              { key: "email", label: "Email" },
              { key: "positionApplying", label: "Position" },
              { key: "compName", label: "Company" },
              {
                key: "experience",
                label: "Exp",
                render: (row) => `${row.experience} yrs`,
              },
              {
                key: "expectedSalary",
                label: "Salary",
                render: (row) =>
                  `₹${Number(row.expectedSalary || 0).toLocaleString()}`,
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status}>{row.status}</Badge>,
              },
              {
                key: "createdAt",
                label: "Applied",
                render: (row) =>
                  row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : "—",
              },
            ]}
            data={filteredData}
            actions={[
              {
                variant: "view",
                label: "View",
                icon: Eye,
                onClick: (row) =>
                  navigate(`/admin/job-application/${row._id}`),
              },
              {
                variant: "delete",
                label: "Delete",
                icon: Trash2,
                onClick: (row) =>
                  handleDelete("jobApplication", row._id),
              },
            ]}
          />
        );

      default:
        return <p>No data available</p>;
    }
  };

  return (
    <AdminLayout>
      <div className="dashboard-content">
        {/* Page Header */}
        <PageHeader
          title="Admin Dashboard"
          subtitle="Monitor and manage platform activities"
          actions={
            <ActionButton
              label="Refresh"
              icon={RefreshCw}
              variant="primary"
              onClick={fetchDashboard}
            />
          }
        />

        {/* Statistics Cards */}
        <Section title="Overview" className="stats-section">
          <div className="stats-grid">
            <StatCard
              title="Total Customers"
              value={counts?.customers ?? 0}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Total Companies"
              value={counts?.companies ?? 0}
              icon={Building2}
              color="purple"
            />
            <StatCard
              title="Total Workers"
              value={counts?.workers ?? 0}
              icon={Briefcase}
              color="green"
            />
            <StatCard
              title="Active Projects"
              value={stats?.activeProjects ?? 0}
              icon={BarChart3}
              color="orange"
            />
            <StatCard
              title="Pending Requests"
              value={stats?.pendingRequests ?? 0}
              icon={BarChart3}
              color="red"
            />
            <StatCard
              title="Open Bids"
              value={stats?.openBids ?? 0}
              icon={BarChart3}
              color="indigo"
            />
          </div>
        </Section>

        {/* Tabs Section */}
        <Section title="Data Management" className="tabs-section">
          <div className="tabs-container">
            <div className="tab-list">
              {[
                {
                  id: "customers",
                  label: "Customers",
                  count: data.data.customers?.length ?? 0,
                },
                {
                  id: "companies",
                  label: "Companies",
                  count: data.data.companies?.length ?? 0,
                  pending: hasPendingCompanies,
                },
                {
                  id: "workers",
                  label: "Workers",
                  count: data.data.workers?.length ?? 0,
                  pending: hasPendingWorkers,
                },
                {
                  id: "architect-hirings",
                  label: "Architect Hirings",
                  count: data.data.architectHirings?.length ?? 0,
                },
                {
                  id: "construction-projects",
                  label: "Projects",
                  count: data.data.constructionProjects?.length ?? 0,
                },
                {
                  id: "design-requests",
                  label: "Design Requests",
                  count: data.data.designRequests?.length ?? 0,
                },
                {
                  id: "bids",
                  label: "Bids",
                  count: data.data.bids?.length ?? 0,
                },
                {
                  id: "job-applications",
                  label: "Job Applications",
                  count: data.data.jobApplications?.length ?? 0,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  <span>
                    {tab.label}
                    <span className="tab-count">{tab.count}</span>
                  </span>
                  {tab.pending && <span className="tab-badge"></span>}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="search-filter-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="Pending">Pending (case)</option>
                <option value="accepted">Accepted</option>
                <option value="Accepted">Accepted (case)</option>
                <option value="rejected">Rejected</option>
                <option value="open">Open</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Table */}
            <div className="table-section">
              {filteredData.length > 0 ? (
                renderTableByTab()
              ) : (
                <div className="no-data-state">
                  <p>No {activeTab} found</p>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
