import React, { useEffect, useState, useMemo, useCallback } from "react";
import "./CompanyHiring.css";

const BACKEND_BASE = "http://localhost:3000";

function useDebounced(fn, wait = 300) {
  // simple debounce hook
  const timeoutRef = React.useRef(null);
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fn(...args), wait);
  }, [fn, wait]);
}

const CompanyHiring = () => {
  const [activeTab, setActiveTab] = useState("find-workers");

  const [workers, setWorkers] = useState([]);
  const [workerRequests, setWorkerRequests] = useState([]);
  const [requestedWorkers, setRequestedWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile modal state
  const [profileModalWorker, setProfileModalWorker] = useState(null);

  // Hire modal state
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [hireForm, setHireForm] = useState({
    position: "",
    location: "",
    salary: "",
    workerId: "",
    workerName: ""
  });

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch initial data
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${BACKEND_BASE}/api/companyhiring`, {
      method: "GET",
      credentials: "include"
    })
      .then(async (res) => {
        // If res is not JSON (HTML error), handle gracefully
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Request failed (${res.status}): ${text.substring(0, 200)}`);
        }
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Expected JSON but got: ${text.substring(0, 200)}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // Backend returns: { workers, workerRequests, requestedWorkers }
        setWorkers(Array.isArray(data.workers) ? data.workers : []);
        setWorkerRequests(Array.isArray(data.workerRequests) ? data.workerRequests : []);
        setRequestedWorkers(Array.isArray(data.requestedWorkers) ? data.requestedWorkers : []);
      })
      .catch((err) => {
        console.error("Hiring fetch error:", err);
        setError(err.message || "Failed to load data");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  // Debounced search setter
  const debouncedSearch = useDebounced((v) => setSearchTerm(v), 250);

  // Filtering derived lists
  const filteredWorkers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return workers;
    return workers.filter(w => {
      const name = (w.name || "").toLowerCase();
      const email = (w.email || "").toLowerCase();
      const skills = (w.specialties || []).join(" ").toLowerCase();
      return name.includes(q) || email.includes(q) || skills.includes(q);
    });
  }, [workers, searchTerm]);

  const filteredWorkerRequests = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return workerRequests;
    return workerRequests.filter(r => {
      const name = (r.workerId?.name || "").toLowerCase();
      const role = (r.positionApplying || "").toLowerCase();
      const loc = (r.location || "").toLowerCase();
      return name.includes(q) || role.includes(q) || loc.includes(q);
    });
  }, [workerRequests, searchTerm]);

  const filteredRequestedWorkers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return requestedWorkers.filter(r => {
      const statusMatch = statusFilter === "all" || (r.status || "").toLowerCase() === statusFilter;
      if (!statusMatch) return false;
      if (!q) return true;
      const text = `${r.worker?.name || ""} ${r.worker?.email || ""} ${r.positionApplying || ""} ${r.location || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [requestedWorkers, searchTerm, statusFilter]);

  // Utilities
  const openProfileModal = (data) => {
    // data: either worker object or object with worker fields
    setProfileModalWorker(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeProfileModal = () => setProfileModalWorker(null);

  const openHireModal = (worker) => {
    setHireForm({
      position: "",
      location: "",
      salary: "",
      workerId: worker._id,
      workerName: worker.name
    });
    setHireModalOpen(true);
  };

  const closeHireModal = () => {
    setHireModalOpen(false);
    setHireForm({
      position: "",
      location: "",
      salary: "",
      workerId: "",
      workerName: ""
    });
  };

  // POST hire request
  const submitHireRequest = async (e) => {
    e.preventDefault();

    // Basic validation similar to your EJS validation
    const locationRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s,\.\-']{2,}$/;
    if (!hireForm.position || hireForm.position.trim().length < 2) {
      alert("Please enter a valid position title (min 2 characters).");
      return;
    }
    if (!hireForm.location || !locationRegex.test(hireForm.location)) {
      alert("Please enter a valid location (e.g., Guntur).");
      return;
    }
    const salaryVal = parseFloat(hireForm.salary);
    if (!hireForm.salary || isNaN(salaryVal) || salaryVal <= 0) {
      alert("Please enter a valid salary greater than 0.");
      return;
    }
    if (!hireForm.workerId) {
      alert("Missing worker ID.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE}/companytoworker`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: hireForm.position.trim(),
          location: hireForm.location.trim(),
          salary: salaryVal,
          workerId: hireForm.workerId
        })
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        const msg = data?.error || data?.message || `Failed (${res.status})`;
        throw new Error(msg);
      }

      alert(data?.message || "Hire request sent successfully.");
      closeHireModal();
      // Optionally refresh requestedWorkers
      // fetch again or optimistically append
    } catch (err) {
      console.error("Hire request error:", err);
      alert("Error: " + (err.message || "Failed to send request"));
    }
  };

  // Accept or Reject request (PATCH)
  const updateRequestStatus = async (requestId, status) => {
    if (!requestId) return;
    if (!["accepted", "rejected"].includes(status)) return;

    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;

    try {
      const res = await fetch(`${BACKEND_BASE}/worker-request/${requestId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        const msg = data?.error || `Failed (${res.status})`;
        throw new Error(msg);
      }

      alert(data?.message || `Request ${status} successfully.`);
      // Remove the card from UI
      setWorkerRequests(prev => prev.filter(r => String(r._id) !== String(requestId)));
      // Optionally reload requestedWorkers
    } catch (err) {
      console.error("Update request error:", err);
      alert("Error updating request: " + (err.message || ""));
    }
  };

  // Render helpers
  const renderExpectedSalary = (request) => {
    if (!request || !request.expectedSalary) return null;
    return (
      <div className="comhiring_expectedSalary">
        <div className="comhiring_salaryLabel"><i className="fas fa-money-bill-wave" /> Expected Salary</div>
        <div className="comhiring_salaryAmount">₹{Number(request.expectedSalary).toLocaleString('en-IN')}/month</div>
      </div>
    );
  };

  return (
    <div className="comhiring_container">
      <div className="comhiring_tabs">
        <div className={`comhiring_tab ${activeTab === "find-workers" ? "active" : ""}`} onClick={() => setActiveTab("find-workers")}>Find Workers</div>
        <div className={`comhiring_tab ${activeTab === "worker-requests" ? "active" : ""}`} onClick={() => setActiveTab("worker-requests")}>Worker Requests</div>
        <div className={`comhiring_tab ${activeTab === "requested-workers" ? "active" : ""}`} onClick={() => setActiveTab("requested-workers")}>Requested Workers</div>
      </div>

      <div className="comhiring_sectionHeader">
        <h2 className="comhiring_title">
          {activeTab === "find-workers" && "Available Workers"}
          {activeTab === "worker-requests" && "Pending Worker Requests"}
          {activeTab === "requested-workers" && "Requested Workers Status"}
        </h2>

        <div className="comhiring_controls">
          <input className="comhiring_search" placeholder={activeTab === "find-workers" ? "Search workers..." : activeTab === "worker-requests" ? "Search requests..." : "Search requested workers..."} onChange={(e) => debouncedSearch(e.target.value)} />
          {activeTab === "requested-workers" && (
            <select className="comhiring_select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>
      </div>

      {loading && <div className="comhiring_info">Loading...</div>}
      {error && <div className="comhiring_error">Error: {error}</div>}

      {/* FIND WORKERS */}
      {activeTab === "find-workers" && !loading && (
        <div className="comhiring_workerGrid">
          {filteredWorkers.length === 0 && <div className="comhiring_info">No workers found.</div>}
          {filteredWorkers.map(worker => (
            <div className="comhiring_workerCard" key={worker._id || worker.id || Math.random()}>
              <div className="comhiring_cardHeader">
                <img className="comhiring_profileImg" src={worker.profileImage || `https://api.dicebear.com/9.x/male/svg?seed=${encodeURIComponent((worker.name||'worker').replace(/\s+/g,''))}`} alt="profile"/>
                <div className="comhiring_rating"><i className="fas fa-star" /> {worker.rating ?? 0}</div>
              </div>

              <div className="comhiring_cardBody">
                <h3 className="comhiring_workerName">{worker.name}</h3>
                <p className="comhiring_workerMeta"><i className="fas fa-envelope" /> {worker.email}</p>
                <p className="comhiring_workerMeta"><i className="fas fa-briefcase" /> {worker.experience} experience</p>

                <div className="comhiring_tags">
                  {(worker.specialties || []).map((s, i) => <span key={i} className="comhiring_tag">{s}</span>)}
                </div>
              </div>

              <div className="comhiring_cardFooter">
                <button className="comhiring_btnView" onClick={() => openProfileModal(worker)}><i className="fas fa-eye" /> View Profile</button>
                <button className="comhiring_btnHire" onClick={() => openHireModal(worker)}><i className="fas fa-user-plus" /> Hire</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WORKER REQUESTS */}
      {activeTab === "worker-requests" && !loading && (
        <div className="comhiring_requestList">
          {filteredWorkerRequests.length === 0 && <div className="comhiring_info">No worker requests at this time.</div>}
          {filteredWorkerRequests.map(req => {
            const worker = req.workerId || {};
            return (
              <div className="comhiring_requestCard" key={req._id}>
                {renderExpectedSalary(req)}
                <div className="comhiring_requestBody">
                  <img className="comhiring_requestProfile" src={worker.profileImage || "https://via.placeholder.com/80x60"} alt="profile"/>
                  <div className="comhiring_requestInfo">
                    <h3>{worker.name}</h3>
                    <div className="comhiring_requestDetailsGrid">
                      <div><span className="comhiring_label"><i className="fas fa-envelope" /> Email:</span> <div className="comhiring_value">{worker.email}</div></div>
                      <div><span className="comhiring_label"><i className="fas fa-user-tie" /> Role:</span> <div className="comhiring_value">{req.positionApplying}</div></div>
                      <div><span className="comhiring_label"><i className="fas fa-map-marker-alt" /> Location:</span> <div className="comhiring_value">{req.location}</div></div>
                      <div><span className="comhiring_label"><i className="fas fa-tools" /> Specialties:</span> <div className="comhiring_value">{(worker.specialties || []).join(", ")}</div></div>
                      <div><span className="comhiring_label"><i className="fas fa-briefcase" /> Experience:</span> <div className="comhiring_value">{worker.experience}</div></div>
                    </div>
                  </div>
                </div>

                <div className="comhiring_requestActions">
                  <button className="comhiring_btnView" onClick={() => openProfileModal(worker)}><i className="fas fa-eye" /> View Profile</button>
                  <button className="comhiring_btnAccept" onClick={() => updateRequestStatus(req._id, "accepted")}><i className="fas fa-check" /> Accept</button>
                  <button className="comhiring_btnReject" onClick={() => updateRequestStatus(req._id, "rejected")}><i className="fas fa-times" /> Reject</button>
                  <DetailsToggle request={req} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUESTED WORKERS TABLE */}
      {activeTab === "requested-workers" && !loading && (
        <div className="comhiring_tableWrap">
          <table className="comhiring_table">
            <thead>
              <tr>
                <th><i className="fas fa-user" /> Worker Name</th>
                <th><i className="fas fa-envelope" /> Email</th>
                <th><i className="fas fa-briefcase" /> Position</th>
                <th><i className="fas fa-map-marker-alt" /> Location</th>
                <th><i className="fas fa-rupee-sign" /> Expected Salary</th>
                <th><i className="fas fa-info-circle" /> Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequestedWorkers.length === 0 && (
                <tr><td colSpan="6" className="comhiring_info">No requested workers found.</td></tr>
              )}
              {filteredRequestedWorkers.map(r => (
                <tr key={r._id}>
                  <td>{r.worker?.name}</td>
                  <td>{r.worker?.email}</td>
                  <td>{r.positionApplying}</td>
                  <td>{r.location}</td>
                  <td>₹{Number(r.expectedSalary || 0).toLocaleString('en-IN')}</td>
                  <td><span className={`comhiring_status comhiring_status_${(r.status || "").toLowerCase()}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PROFILE MODAL */}
      {profileModalWorker && (
        <div className="comhiring_modalBackdrop" onClick={closeProfileModal}>
          <div className="comhiring_modal" onClick={(e) => e.stopPropagation()}>
            <button className="comhiring_modalClose" onClick={closeProfileModal}>×</button>
            <div className="comhiring_modalHeader">
              <img src={profileModalWorker.profileImage || `https://api.dicebear.com/9.x/male/svg?seed=${encodeURIComponent((profileModalWorker.name||'worker').replace(/\s+/g,''))}`} alt="profile" className="comhiring_modalProfileImg" />
              <div>
                <h2>{profileModalWorker.name}</h2>
                <p className="comhiring_modalTitle">{profileModalWorker.title || ""}</p>
                <div className="comhiring_modalRating">{[...Array(5)].map((_,i)=>(<i key={i} className={i < Math.round(profileModalWorker.rating || 0) ? "fas fa-star" : "far fa-star"} />))} <span>({profileModalWorker.rating ?? 0})</span></div>
              </div>
            </div>

            <div className="comhiring_modalBody">
              <section>
                <h4><i className="fas fa-info-circle" /> About</h4>
                <p>{profileModalWorker.about || "No information available."}</p>
              </section>

              <section>
                <h4><i className="fas fa-tools" /> Specialties</h4>
                <p>{(profileModalWorker.specialties || []).join(", ")}</p>
              </section>

              <section>
                <h4><i className="fas fa-briefcase" /> Notable Projects</h4>
                <div className="comhiring_projectsGrid">
                  {(profileModalWorker.projects && profileModalWorker.projects.length > 0) ? profileModalWorker.projects.map((p, idx) => (
                    <div className="comhiring_project" key={idx}>
                      <img src={p.image || "https://via.placeholder.com/300x200"} alt={p.title || "project"} />
                      <div className="comhiring_projectInfo">
                        <h5>{p.title}</h5>
                        <p>{p.location}</p>
                        <p>{p.description}</p>
                      </div>
                    </div>
                  )) : <p>No notable projects available.</p>}
                </div>
              </section>

              <section style={{display: "none"}}>
                <h4><i className="fas fa-address-book" /> Contact</h4>
                <div><strong>Phone:</strong> {profileModalWorker.contact || "N/A"}</div>
                <div><strong>Location:</strong> {profileModalWorker.location || "N/A"}</div>
                <div><strong>LinkedIn:</strong> {profileModalWorker.linkedin ? <a href={profileModalWorker.linkedin} target="_blank" rel="noreferrer">{profileModalWorker.linkedin}</a> : "N/A"}</div>
                <div><strong>Previous Work:</strong> {profileModalWorker.previousWork || "N/A"}</div>
              </section>
            </div>

            <div className="comhiring_modalFooter">
              <button className="comhiring_btnHire" onClick={() => { openHireModal(profileModalWorker); closeProfileModal(); }}><i className="fas fa-user-plus" /> Hire</button>
            </div>
          </div>
        </div>
      )}

      {/* HIRE MODAL */}
      {hireModalOpen && (
        <div className="comhiring_modalBackdrop" onClick={closeHireModal}>
          <div className="comhiring_modal" onClick={(e) => e.stopPropagation()}>
            <button className="comhiring_modalClose" onClick={closeHireModal}>×</button>
            <div className="comhiring_modalHeader">
              <h2>Hire Worker</h2>
              <p>Sending hire request to <strong>{hireForm.workerName}</strong></p>
            </div>

            <form className="comhiring_modalBody" onSubmit={submitHireRequest}>
              <label className="comhiring_label">Position</label>
              <input className="comhiring_input" value={hireForm.position} onChange={(e)=>setHireForm(f=>({...f, position: e.target.value}))} required minLength={2} />

              <label className="comhiring_label">Location</label>
              <input className="comhiring_input" value={hireForm.location} onChange={(e)=>setHireForm(f=>({...f, location: e.target.value}))} required minLength={2} />

              <label className="comhiring_label">Salary (₹/month)</label>
              <input className="comhiring_input" type="number" value={hireForm.salary} onChange={(e)=>setHireForm(f=>({...f, salary: e.target.value}))} required min={10} />

              <div className="comhiring_modalFooter">
                <button type="button" className="comhiring_btnCancel" onClick={closeHireModal}>Cancel</button>
                <button type="submit" className="comhiring_btnHire">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Small component for Details toggle (for each request)
const DetailsToggle = ({ request }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(v => !v);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button className={`comhiring_btnToggle ${open ? "open" : ""}`} onClick={toggle}>
        <i className={`fas ${open ? "fa-chevron-up" : "fa-chevron-down"}`}></i> {open ? "Hide Details" : "Details"}
      </button>
      {open && (
        <div className="comhiring_details">
          <div className="comhiring_detailItem"><strong>Full Name:</strong> {request.fullName}</div>
          <div className="comhiring_detailItem"><strong>Email:</strong> {request.email}</div>
          <div className="comhiring_detailItem"><strong>Experience:</strong> {request.experience} years</div>
          <div className="comhiring_detailItem"><strong>Primary Skills:</strong> {(request.primarySkills||[]).join(", ")}</div>
          <div className="comhiring_detailItem"><strong>Resume:</strong> {request.resume ? <a href={request.resume} target="_blank" rel="noreferrer">Download</a> : "N/A"}</div>
        </div>
      )}
    </div>
  );
};

export default CompanyHiring;
