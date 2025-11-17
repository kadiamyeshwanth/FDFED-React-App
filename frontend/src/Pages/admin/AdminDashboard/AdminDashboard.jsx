import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const apiBase = ""; // leave empty to use same origin or set VITE_API_URL

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

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admindashboard`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json();
      // controller returns { counts, stats, data }
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = await fetch(`${apiBase}/admin/delete-${type}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await fetchDashboard();
      alert(json.message || "Deleted");
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const tabData = useMemo(() => {
    const d = data.data;
    switch (activeTab) {
      case "customers": return d.customers || [];
      case "companies": return d.companies || [];
      case "workers": return d.workers || [];
      case "architect-hirings": return d.architectHirings || [];
      case "construction-projects": return d.constructionProjects || [];
      case "design-requests": return d.designRequests || [];
      case "bids": return d.bids || [];
      case "job-applications": return d.jobApplications || [];
      default: return [];
    }
  }, [activeTab, data]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(tabData)) return [];
    const q = search.trim().toLowerCase();
    return tabData.filter(item => {
      // status filter
      if (statusFilter !== "all") {
        const s = (item.status || item.availability || "").toString();
        if (s.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      if (!q) return true;
      return JSON.stringify(item).toLowerCase().includes(q);
    });
  }, [tabData, search, statusFilter]);

  if (loading) return <div className="dashboard-loading">Loading dashboard…</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  const { counts, stats } = data;

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>🎯 Admin Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchDashboard}>🔄 Refresh Data</button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Customers</h3>
          <div className="value">{counts?.customers ?? 0}</div>
        </div>
        <div className="stat-card purple">
          <h3>Total Companies</h3>
          <div className="value">{counts?.companies ?? 0}</div>
        </div>
        <div className="stat-card green">
          <h3>Total Workers</h3>
          <div className="value">{counts?.workers ?? 0}</div>
        </div>
        <div className="stat-card orange">
          <h3>Active Projects</h3>
          <div className="value">{stats?.activeProjects ?? 0}</div>
        </div>
        <div className="stat-card red">
          <h3>Pending Requests</h3>
          <div className="value">{stats?.pendingRequests ?? 0}</div>
        </div>
        <div className="stat-card indigo">
          <h3>Open Bids</h3>
          <div className="value">{stats?.openBids ?? 0}</div>
        </div>
      </div>

      <div className="tabs">
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === "customers" ? "active" : ""}`} onClick={() => { setActiveTab("customers"); setSearch(""); setStatusFilter("all"); }}>
            Customers ({data.data.customers?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "companies" ? "active" : ""}`} onClick={() => { setActiveTab("companies"); setSearch(""); setStatusFilter("all"); }}>
            Companies ({data.data.companies?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "workers" ? "active" : ""}`} onClick={() => { setActiveTab("workers"); setSearch(""); setStatusFilter("all"); }}>
            Workers ({data.data.workers?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "architect-hirings" ? "active" : ""}`} onClick={() => { setActiveTab("architect-hirings"); setSearch(""); setStatusFilter("all"); }}>
            Architect Hirings ({data.data.architectHirings?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "construction-projects" ? "active" : ""}`} onClick={() => { setActiveTab("construction-projects"); setSearch(""); setStatusFilter("all"); }}>
            Construction Projects ({data.data.constructionProjects?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "design-requests" ? "active" : ""}`} onClick={() => { setActiveTab("design-requests"); setSearch(""); setStatusFilter("all"); }}>
            Design Requests ({data.data.designRequests?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "bids" ? "active" : ""}`} onClick={() => { setActiveTab("bids"); setSearch(""); setStatusFilter("all"); }}>
            Bids ({data.data.bids?.length ?? 0})
          </button>
          <button className={`tab-btn ${activeTab === "job-applications" ? "active" : ""}`} onClick={() => { setActiveTab("job-applications"); setSearch(""); setStatusFilter("all"); }}>
            Job Applications ({data.data.jobApplications?.length ?? 0})
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>
            {activeTab.split("-").map(s => s[0]?.toUpperCase() + s.slice(1)).join(" ")}
          </h2>
          <div className="search-filter">
            <input className="search-box" placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} />
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
        </div>

        <div className="table-container">
          {/* Render tables per tab */}
          {activeTab === "customers" && (
            filteredData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Date of Birth</th><th>Joined Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(c => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.dob ? new Date(c.dob).toLocaleDateString() : "—"}</td>
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/customer/${c._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("customer", c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Customers Found</h3></div>
          )}

          {activeTab === "companies" && (
            filteredData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Company Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Location</th><th>Size</th><th>Projects Completed</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(c => (
                    <tr key={c._id}>
                      <td>{c.companyName}</td>
                      <td>{c.contactPerson}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.location?.city || "N/A"}</td>
                      <td>{c.size || "N/A"}</td>
                      <td>{c.projectsCompleted || 0}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/company/${c._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("company", c._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Companies Found</h3></div>
          )}

          {activeTab === "workers" && (
            filteredData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Specialization</th><th>Experience</th><th>Rating</th><th>Availability</th><th>Is Architect</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(w => (
                    <tr key={w._id} data-status={w.availability}>
                      <td>{w.name}</td>
                      <td>{w.email}</td>
                      <td>{w.specialization}</td>
                      <td>{w.experience ?? "0"} years</td>
                      <td><span className="rating">⭐ {Number(w.rating ?? 0).toFixed(1)}</span></td>
                      <td><span className={`badge ${w.availability}`}>{w.availability}</span></td>
                      <td>{w.isArchitect ? "Yes" : "No"}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/worker/${w._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("worker", w._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Workers Found</h3></div>
          )}

          {activeTab === "architect-hirings" && (
            filteredData.length > 0 ? (
              <table>
                <thead>
                  <tr><th>Project Name</th><th>Customer</th><th>Design Type</th><th>Plot Size</th><th>Budget</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredData.map(h => (
                    <tr key={h._id} data-status={h.status}>
                      <td>{h.projectName}</td>
                      <td>{h.customer?.name || h.customerDetails?.fullName || "—"}</td>
                      <td>{h.designRequirements?.designType || "—"}</td>
                      <td>{h.plotInformation?.plotSize || "—"}</td>
                      <td>{h.additionalDetails?.budget ?? "N/A"}</td>
                      <td><span className={`badge ${h.status}`}>{h.status}</span></td>
                      <td>{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/architect-hiring/${h._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("architectHiring", h._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Architect Hirings Found</h3></div>
          )}

          {activeTab === "construction-projects" && (
            filteredData.length > 0 ? (
              <table>
                <thead><tr><th>Project</th><th>Customer</th><th>Building Type</th><th>Total Area</th><th>Budget</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.map(p => (
                    <tr key={p._id} data-status={p.status}>
                      <td>{p.projectName}</td>
                      <td>{p.customerName || p.customerId?.name}</td>
                      <td>{p.buildingType}</td>
                      <td>{p.totalArea} sq ft</td>
                      <td>₹{p.estimatedBudget?.toLocaleString() || "N/A"}</td>
                      <td>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.completionPercentage ?? 0}%` }} /></div>
                        {p.completionPercentage ?? 0}%
                      </td>
                      <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/construction-project/${p._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("constructionProject", p._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Construction Projects Found</h3></div>
          )}

          {activeTab === "design-requests" && (
            filteredData.length > 0 ? (
              <table>
                <thead><tr><th>Project</th><th>Customer</th><th>Room Type</th><th>Room Size</th><th>Preference</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.map(r => (
                    <tr key={r._id} data-status={r.status}>
                      <td>{r.projectName}</td>
                      <td>{r.fullName || r.customerId?.name}</td>
                      <td>{r.roomType}</td>
                      <td>{r.roomSize ? `${r.roomSize.length} x ${r.roomSize.width} ${r.roomSize.unit}` : "—"}</td>
                      <td>{r.designPreference || "N/A"}</td>
                      <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/design-request/${r._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("designRequest", r._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Design Requests Found</h3></div>
          )}

          {activeTab === "bids" && (
            filteredData.length > 0 ? (
              <table>
                <thead><tr><th>Customer</th><th>Building Type</th><th>Total Area</th><th>Budget</th><th>Total Bids</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.map(b => (
                    <tr key={b._id} data-status={b.status}>
                      <td>{b.customerName}</td>
                      <td>{b.buildingType}</td>
                      <td>{b.totalArea} sq ft</td>
                      <td>₹{b.estimatedBudget?.toLocaleString() || "N/A"}</td>
                      <td>{b.companyBids?.length ?? 0}</td>
                      <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                      <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/bid/${b._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("bid", b._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Bids Found</h3></div>
          )}

          {activeTab === "job-applications" && (
            filteredData.length > 0 ? (
              <table>
                <thead><tr><th>Applicant</th><th>Email</th><th>Position</th><th>Company</th><th>Experience</th><th>Expected Salary</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredData.map(a => (
                    <tr key={a._id} data-status={a.status}>
                      <td>{a.fullName}</td>
                      <td>{a.email}</td>
                      <td>{a.positionApplying}</td>
                      <td>{a.compName}</td>
                      <td>{a.experience} years</td>
                      <td>₹{Number(a.expectedSalary || 0).toLocaleString()}</td>
                      <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                      <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
                      <td>
                        <button className="action-btn view" onClick={() => navigate(`/admin/job-application/${a._id}`)}>View</button>
                        <button className="action-btn delete" onClick={() => handleDelete("jobApplication", a._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><h3>No Job Applications Found</h3></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;