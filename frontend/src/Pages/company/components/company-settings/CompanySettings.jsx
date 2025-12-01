// CompanySettings.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import "./CompanySettings.css";

const API_GET = "http://localhost:3000/api/companysettings";
const API_POST_UPDATE = "http://localhost:3000/api/update-company-profile";
; // server route (multipart/form-data supported)

export default function CompanySettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [company, setCompany] = useState({
    workerProfile: {
      name: "",
      location: "",
      size: "",
      specializations: [],
      currentOpenings: [],
      about: "",
      whyJoin: ""
    },
    customerProfile: {
      name: "",
      location: "",
      projectsCompleted: 0,
      yearsInBusiness: 0,
      about: "",
      didYouKnow: "",
      teamMembers: [],
      completedProjects: []
    }
  });

  const [activeSection, setActiveSection] = useState("profile"); // sidebar sections: profile, security, help, logout
  const [activeProfileTab, setActiveProfileTab] = useState("worker"); // worker | customer

  // Edit mode toggles
  const [editingWorker, setEditingWorker] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);

  // Worker form state (controlled)
  const [workerForm, setWorkerForm] = useState({
    companyName: "",
    companyLocation: "",
    companySize: "",
    specializations: "",
    currentOpenings: [],
    aboutCompany: "",
    whyJoinUs: ""
  });

  // Customer form refs/controlled + file inputs
  const [customerForm, setCustomerForm] = useState({
    companyName: "",
    companyLocation: "",
    projectsCompleted: 0,
    yearsInBusiness: 0,
    customerAboutCompany: "",
    didYouKnow: "",
    // teamMembers & completedProjects will be arrays of objects
    teamMembers: [],
    completedProjects: []
  });
  // we will store file inputs in refs so we can append them to FormData conditionally
  const teamFileInputs = useRef([]);
  const projectFileInputs = useRef([]);

  // Security form (local)
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCompany() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_GET, {
        credentials: "include"
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch settings. ${res.status} ${res.statusText} ${txt}`);
      }
      const payload = await res.json();
      if (!payload || !payload.company) {
        throw new Error("Invalid response shape (company missing).");
      }
      setCompany(payload.company);

      // populate forms from payload
      const w = payload.company.workerProfile || {};
      setWorkerForm({
        companyName: w.name || "",
        companyLocation: w.location || "",
        companySize: w.size || "",
        specializations: (w.specializations && w.specializations.join(", ")) || "",
        currentOpenings: w.currentOpenings ? [...w.currentOpenings] : [],
        aboutCompany: w.about || "",
        whyJoinUs: w.whyJoin || ""
      });

      const c = payload.company.customerProfile || {};
      setCustomerForm({
        companyName: c.name || "",
        companyLocation: c.location || "",
        projectsCompleted: c.projectsCompleted || 0,
        yearsInBusiness: c.yearsInBusiness || 0,
        customerAboutCompany: c.about || "",
        didYouKnow: c.didYouKnow || "",
        teamMembers: c.teamMembers && c.teamMembers.length ? c.teamMembers.map(tm => ({ ...tm })) : [],
        completedProjects: c.completedProjects && c.completedProjects.length ? c.completedProjects.map(p => ({ ...p })) : []
      });

      // reset file inputs refs
      teamFileInputs.current = [];
      projectFileInputs.current = [];
    } catch (err) {
      console.error("Fetch error", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // Worker form handlers
  function handleWorkerChange(e) {
    const { name, value } = e.target;
    setWorkerForm(prev => ({ ...prev, [name]: value }));
  }

  function addOpening() {
    setWorkerForm(prev => ({ ...prev, currentOpenings: [...prev.currentOpenings, ""] }));
  }
  function updateOpening(idx, value) {
    setWorkerForm(prev => {
      const arr = [...prev.currentOpenings];
      arr[idx] = value;
      return { ...prev, currentOpenings: arr };
    });
  }
  function removeOpening(idx) {
    setWorkerForm(prev => {
      const arr = prev.currentOpenings.filter((_, i) => i !== idx);
      return { ...prev, currentOpenings: arr };
    });
  }

  async function submitWorkerProfile(e) {
    e.preventDefault();
    // basic validation
    if (!workerForm.companyLocation || workerForm.companyLocation.length < 2) {
      alert("Please enter a valid location.");
      return;
    }
    if (!workerForm.companySize) {
      alert("Please select a company size.");
      return;
    }

    try {
      const payload = {
        profileType: "worker",
        companyLocation: workerForm.companyLocation,
        companySize: workerForm.companySize,
        specializations: workerForm.specializations,
        aboutCompany: workerForm.aboutCompany,
        whyJoinUs: workerForm.whyJoinUs,
        currentOpenings: workerForm.currentOpenings
      };

      const res = await fetch(API_POST_UPDATE, {
        method: "POST",
        credentials: "include",
        headers: {
          // Do not set Content-Type because we are sending JSON here
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update worker profile.");

      // reload fresh data
      await fetchCompany();
      setEditingWorker(false);
      alert("Worker profile updated successfully.");
    } catch (err) {
      console.error("Worker update error:", err);
      alert("Error updating worker profile: " + (err.message || err));
    }
  }

  // Customer handlers (FormData because files may be included)
  function handleCustomerChange(e) {
    const { name, value } = e.target;
    setCustomerForm(prev => ({ ...prev, [name]: value }));
  }

  // team members & project items management
  function addTeamMember() {
    setCustomerForm(prev => ({ ...prev, teamMembers: [...prev.teamMembers, { name: "", position: "", image: "" }] }));
    // push placeholder in files refs (kept empty)
    teamFileInputs.current.push(null);
  }
  function updateTeamMember(idx, key, value) {
    setCustomerForm(prev => {
      const tm = prev.teamMembers.map((m, i) => (i === idx ? { ...m, [key]: value } : m));
      return { ...prev, teamMembers: tm };
    });
  }
  function removeTeamMember(idx) {
    setCustomerForm(prev => {
      const tm = prev.teamMembers.filter((_, i) => i !== idx);
      // remove file ref
      teamFileInputs.current.splice(idx, 1);
      return { ...prev, teamMembers: tm };
    });
  }

  function addProject() {
    setCustomerForm(prev => ({ ...prev, completedProjects: [...prev.completedProjects, { title: "", description: "", image: "" }] }));
    projectFileInputs.current.push(null);
  }
  function updateProject(idx, key, value) {
    setCustomerForm(prev => {
      const arr = prev.completedProjects.map((p, i) => (i === idx ? { ...p, [key]: value } : p));
      return { ...prev, completedProjects: arr };
    });
  }
  function removeProject(idx) {
    setCustomerForm(prev => {
      const arr = prev.completedProjects.filter((_, i) => i !== idx);
      projectFileInputs.current.splice(idx, 1);
      return { ...prev, completedProjects: arr };
    });
  }

  // file input handlers: preview and store file input element in refs
  function handleTeamFileChange(e, idx) {
    const file = e.target.files[0];
    teamFileInputs.current[idx] = file || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateTeamMember(idx, "image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
  function handleProjectFileChange(e, idx) {
    const file = e.target.files[0];
    projectFileInputs.current[idx] = file || null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateProject(idx, "image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function submitCustomerProfile(e) {
    e.preventDefault();
    // Basic validations
    if (!customerForm.customerCompanyLocation && !customerForm.companyLocation) {
      // allow companyLocation field name difference
      // earlier set companyLocation vs customerCompanyLocation
    }

    // Build FormData
    const fd = new FormData();
    fd.append("profileType", "customer");
    fd.append("companyLocation", customerForm.companyLocation || "");
    fd.append("projectsCompleted", customerForm.projectsCompleted || 0);
    fd.append("yearsInBusiness", customerForm.yearsInBusiness || 0);
    fd.append("customerAboutCompany", customerForm.customerAboutCompany || "");
    fd.append("didYouKnow", customerForm.didYouKnow || "");

    // teamMembers - send JSON and optionally files
    const teamMembersPayload = customerForm.teamMembers.map((m, i) => {
      // If a file exists for this index, we'll append it separately
      return {
        name: m.name || "",
        position: m.position || "",
        image: m.image || ""
      };
    });
    fd.append("teamMembers", JSON.stringify(teamMembersPayload));

    teamFileInputs.current.forEach((file, idx) => {
      if (file) {
        fd.append("memberImages", file, `member_image_${idx}`);
      }
    });

    // completedProjects - JSON + files
    const projectsPayload = customerForm.completedProjects.map((p, i) => ({
      title: p.title || "",
      description: p.description || "",
      image: p.image || ""
    }));
    fd.append("completedProjects", JSON.stringify(projectsPayload));
    projectFileInputs.current.forEach((file, idx) => {
      if (file) {
        fd.append("projectImages", file, `project_image_${idx}`);
      }
    });

    try {
      const res = await fetch(API_POST_UPDATE, {
        method: "POST",
        credentials: "include",
        // DO NOT set Content-Type; browser will set multipart boundary
        body: fd
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        // try to parse json
        if (contentType.includes("application/json")) {
          const err = await res.json();
          throw new Error(err.message || "Failed to update customer profile");
        } else {
          const text = await res.text();
          throw new Error("Server returned error: " + text);
        }
      }

      // success
      await fetchCompany();
      setEditingCustomer(false);
      alert("Customer profile updated successfully.");
    } catch (err) {
      console.error("Customer update error:", err);
      alert("Error updating customer profile: " + (err.message || err));
    }
  }

  // Security form handlers
  function handleSecurityChange(e) {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));
  }
  async function submitSecurity(e) {
    e.preventDefault();
    if (!securityForm.currentPassword) {
      alert("Enter current password");
      return;
    }
    if (!securityForm.newPassword || securityForm.newPassword.length < 8) {
      alert("New password must be at least 8 characters");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/company/password/update',
        {
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword
        },
        { withCredentials: true }
      );

      if (response.data) {
        alert("Password updated successfully!");
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error('Password update error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update password. Please try again.';
      alert(errorMsg);
    }
  }

  // small helper to toggle sidebar section
  function openSection(name) {
    setActiveSection(name);
  }

  if (loading) {
    return <div className="cs-loading">Loading company settings...</div>;
  }

  if (error) {
    return (
      <div className="cs-error">
        <p>Error loading settings: {error}</p>
        <button className="cs-btn-primary" onClick={fetchCompany}>Retry</button>
      </div>
    );
  }

  return (
    <div className="cs-root">
      <div className="cs-inner">
        <header className="cs-header">
          <h1 className="cs-title">Company Settings</h1>
          <p className="cs-subtitle">Manage your company profile and settings</p>
        </header>

        <div className="cs-grid">
          <aside className="cs-sidebar">
            <nav className="cs-nav">
              <button className={`cs-nav-link ${activeSection === "profile" ? "active" : ""}`} onClick={() => openSection("profile")}>
                <i className="fas fa-building" /> Company Profile
              </button>
              <button className={`cs-nav-link ${activeSection === "security" ? "active" : ""}`} onClick={() => openSection("security")}>
                <i className="fas fa-lock" /> Security
              </button>
              <button className={`cs-nav-link ${activeSection === "help" ? "active" : ""}`} onClick={() => openSection("help")}>
                <i className="fas fa-question-circle" /> Help Center
              </button>
              <button
                className="cs-nav-link cs-nav-link-logout"
                onClick={async() => {
                  await axios.get("/api/logout", {}, { withCredentials: true });
                  window.location.href = "http://localhost:5173/";
                }}
              >
              <i className="fas fa-sign-out-alt" /> Logout
              </button>
            </nav>
          </aside>

          <main className="cs-content">
            {/* PROFILE SECTION */}
            <section className={`cs-section ${activeSection === "profile" ? "cs-active" : ""}`}>
              <div className="cs-profile-tabs">
                <button
                  className={`cs-profile-tab ${activeProfileTab === "worker" ? "active" : ""}`}
                  onClick={() => setActiveProfileTab("worker")}
                >
                  Worker Profile
                </button>
                <button
                  className={`cs-profile-tab ${activeProfileTab === "customer" ? "active" : ""}`}
                  onClick={() => setActiveProfileTab("customer")}
                >
                  Customer Profile
                </button>
              </div>

              {/* WORKER PROFILE DISPLAY */}
              <div className={`cs-profile-content ${activeProfileTab === "worker" ? "cs-visible" : ""}`}>
                {!editingWorker ? (
                  <div className="cs-display">
                    <div className="cs-row">
                      <label>Company Name</label>
                      <p>{company.workerProfile.name}</p>
                    </div>
                    <div className="cs-row">
                      <label>Location</label>
                      <p>{company.workerProfile.location}</p>
                    </div>
                    <div className="cs-row">
                      <label>Company Size</label>
                      <p>{company.workerProfile.size}</p>
                    </div>
                    <div className="cs-row">
                      <label>Specializations</label>
                      <div className="cs-tags">
                        {(company.workerProfile.specializations || []).map((s, i) => (
                          <span className="cs-tag" key={i}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="cs-row">
                      <label>Current Openings</label>
                      <div>
                        {(company.workerProfile.currentOpenings || []).map((op, i) => (
                          <div className="cs-opening" key={i}>{op}</div>
                        ))}
                      </div>
                    </div>
                    <div className="cs-row">
                      <label>About the Company</label>
                      <p>{company.workerProfile.about}</p>
                    </div>
                    <div className="cs-row">
                      <label>Why Join Our Team?</label>
                      <p>{company.workerProfile.whyJoin}</p>
                    </div>

                    <div className="cs-actions">
                      <button className="cs-btn-primary" onClick={() => setEditingWorker(true)}>Edit Worker Profile</button>
                    </div>
                  </div>
                ) : (
                  <form className="cs-form" onSubmit={submitWorkerProfile}>
                    <div className="cs-form-row">
                      <label>Company Name</label>
                      <input type="text" className="cs-input" name="companyName" value={workerForm.companyName} readOnly />
                    </div>
                    <div className="cs-form-row">
                      <label>Location</label>
                      <input className="cs-input" name="companyLocation" value={workerForm.companyLocation} onChange={handleWorkerChange} required />
                    </div>
                    <div className="cs-form-row">
                      <label>Company Size</label>
                      <select name="companySize" className="cs-input" value={workerForm.companySize} onChange={handleWorkerChange} required>
                        <option value="">Select size</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-1000">201-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>

                    <div className="cs-form-row">
                      <label>Specializations (comma separated)</label>
                      <input className="cs-input" name="specializations" value={workerForm.specializations} onChange={handleWorkerChange} />
                    </div>

                    <div className="cs-form-row">
                      <label>Current Openings</label>
                      <div className="cs-dynamic-list">
                        {workerForm.currentOpenings.map((op, i) => (
                          <div key={i} className="cs-dynamic-row">
                            <input className="cs-input" value={op} onChange={(e) => updateOpening(i, e.target.value)} />
                            <button type="button" className="cs-btn-danger" onClick={() => removeOpening(i)}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="cs-btn-secondary" onClick={addOpening}>+ Add Opening</button>
                      </div>
                    </div>

                    <div className="cs-form-row">
                      <label>About the Company</label>
                      <textarea className="cs-textarea" name="aboutCompany" value={workerForm.aboutCompany} onChange={handleWorkerChange} />
                    </div>

                    <div className="cs-form-row">
                      <label>Why Join Our Team?</label>
                      <textarea className="cs-textarea" name="whyJoinUs" value={workerForm.whyJoinUs} onChange={handleWorkerChange} />
                    </div>

                    <div className="cs-actions">
                      <button type="button" className="cs-btn-secondary" onClick={() => { setEditingWorker(false); /* reset to server values */ fetchCompany(); }}>Cancel</button>
                      <button type="submit" className="cs-btn-primary">Save Changes</button>
                    </div>
                  </form>
                )}
              </div>

              {/* CUSTOMER PROFILE DISPLAY / EDIT */}
              <div className={`cs-profile-content ${activeProfileTab === "customer" ? "cs-visible" : ""}`}>
                {!editingCustomer ? (
                  <div className="cs-display">
                    <div className="cs-row">
                      <label>Company Name</label>
                      <p>{company.customerProfile.name}</p>
                    </div>
                    <div className="cs-row">
                      <label>Location</label>
                      <p>{company.customerProfile.location}</p>
                    </div>
                    <div className="cs-row">
                      <label>Projects Completed</label>
                      <p>{company.customerProfile.projectsCompleted}</p>
                    </div>
                    <div className="cs-row">
                      <label>Years in Business</label>
                      <p>{company.customerProfile.yearsInBusiness}</p>
                    </div>
                    <div className="cs-row">
                      <label>About Company For Customers</label>
                      <p>{company.customerProfile.about}</p>
                    </div>

                    <div className="cs-row">
                      <label>Team Members</label>
                      <div>
                        {(company.customerProfile.teamMembers || []).map((m, i) => (
                          <div className="cs-team-item" key={i}>
                            {m.image && <img src={m.image} alt={m.name} className="cs-team-img" />}
                            <div className="cs-team-info">
                              <strong>{m.name}</strong>
                              <div className="cs-muted">{m.position}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="cs-row">
                      <label>Completed Projects</label>
                      <div>
                        {(company.customerProfile.completedProjects || []).map((p, i) => (
                          <div className="cs-project-item" key={i}>
                            {p.image && <img src={p.image} alt={p.title} className="cs-project-img" />}
                            <div className="cs-project-info">
                              <strong>{p.title}</strong>
                              <div className="cs-muted">{p.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="cs-row">
                      <label>Did You Know?</label>
                      <div className="cs-did-you-know">{company.customerProfile.didYouKnow}</div>
                    </div>

                    <div className="cs-actions">
                      <button className="cs-btn-primary" onClick={() => setEditingCustomer(true)}>Edit Customer Profile</button>
                    </div>
                  </div>
                ) : (
                  <form className="cs-form" onSubmit={submitCustomerProfile}>
                    <div className="cs-form-row">
                      <label>Company Name</label>
                      <input className="cs-input" value={customerForm.companyName} readOnly />
                    </div>

                    <div className="cs-form-row">
                      <label>Location</label>
                      <input className="cs-input" name="companyLocation" value={customerForm.companyLocation} onChange={handleCustomerChange} />
                    </div>

                    <div className="cs-form-row">
                      <label>Projects Completed</label>
                      <input type="number" className="cs-input" name="projectsCompleted" value={customerForm.projectsCompleted} onChange={(e) => setCustomerForm(prev => ({ ...prev, projectsCompleted: e.target.value }))} />
                    </div>

                    <div className="cs-form-row">
                      <label>Years in Business</label>
                      <input type="number" className="cs-input" name="yearsInBusiness" value={customerForm.yearsInBusiness} onChange={(e) => setCustomerForm(prev => ({ ...prev, yearsInBusiness: e.target.value }))} />
                    </div>

                    <div className="cs-form-row">
                      <label>About the Company</label>
                      <textarea className="cs-textarea" name="customerAboutCompany" value={customerForm.customerAboutCompany} onChange={handleCustomerChange} />
                    </div>

                    <div className="cs-form-row">
                      <label>Team Members</label>
                      <div className="cs-dynamic-list">
                        {customerForm.teamMembers.map((member, idx) => (
                          <div key={idx} className="cs-dynamic-row cs-team-edit-row">
                            <div className="cs-team-edit-left">
                              <img className="cs-team-img" src={member.image || "https://via.placeholder.com/60"} alt={member.name || "member"} />
                              <input type="file" onChange={(e) => handleTeamFileChange(e, idx)} />
                            </div>
                            <div className="cs-team-edit-right">
                              <input className="cs-input" placeholder="Name" value={member.name || ""} onChange={(e) => updateTeamMember(idx, "name", e.target.value)} />
                              <input className="cs-input" placeholder="Position" value={member.position || ""} onChange={(e) => updateTeamMember(idx, "position", e.target.value)} />
                              <div className="cs-team-row-actions">
                                <button type="button" className="cs-btn-danger" onClick={() => removeTeamMember(idx)}>Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div>
                          <button type="button" className="cs-btn-secondary" onClick={addTeamMember}>+ Add Team Member</button>
                        </div>
                      </div>
                    </div>

                    <div className="cs-form-row">
                      <label>Completed Projects</label>
                      <div className="cs-dynamic-list">
                        {customerForm.completedProjects.map((proj, idx) => (
                          <div key={idx} className="cs-dynamic-row cs-project-edit-row">
                            <div className="cs-project-edit-left">
                              <img className="cs-project-img" src={proj.image || "https://via.placeholder.com/120x80"} alt={proj.title || "project"} />
                              <input type="file" onChange={(e) => handleProjectFileChange(e, idx)} />
                            </div>
                            <div className="cs-project-edit-right">
                              <input className="cs-input" placeholder="Title" value={proj.title || ""} onChange={(e) => updateProject(idx, "title", e.target.value)} />
                              <textarea className="cs-textarea" placeholder="Description" value={proj.description || ""} onChange={(e) => updateProject(idx, "description", e.target.value)} />
                              <div className="cs-team-row-actions">
                                <button type="button" className="cs-btn-danger" onClick={() => removeProject(idx)}>Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div>
                          <button type="button" className="cs-btn-secondary" onClick={addProject}>+ Add Project</button>
                        </div>
                      </div>
                    </div>

                    <div className="cs-form-row">
                      <label>Did You Know?</label>
                      <textarea className="cs-textarea" name="didYouKnow" value={customerForm.didYouKnow} onChange={handleCustomerChange} />
                    </div>

                    <div className="cs-actions">
                      <button type="button" className="cs-btn-secondary" onClick={() => { setEditingCustomer(false); fetchCompany(); }}>Cancel</button>
                      <button type="submit" className="cs-btn-primary">Save Changes</button>
                    </div>
                  </form>
                )}
              </div>
            </section>

            {/* SECURITY SECTION */}
            <section className={`cs-section ${activeSection === "security" ? "cs-active" : ""}`}>
              <h2 className="cs-section-title">Security Settings</h2>
              <form className="cs-form" onSubmit={submitSecurity}>
                <div className="cs-form-row">
                  <label>Current Password</label>
                  <input type="password" name="currentPassword" className="cs-input" value={securityForm.currentPassword} onChange={handleSecurityChange} required />
                </div>
                <div className="cs-form-row">
                  <label>New Password</label>
                  <input type="password" name="newPassword" className="cs-input" value={securityForm.newPassword} onChange={handleSecurityChange} required />
                </div>
                <div className="cs-form-row">
                  <label>Confirm New Password</label>
                  <input type="password" name="confirmPassword" className="cs-input" value={securityForm.confirmPassword} onChange={handleSecurityChange} required />
                </div>
                <div className="cs-actions">
                  <button type="submit" className="cs-btn-primary">Update Password</button>
                </div>
              </form>
            </section>

            {/* HELP CENTER */}
            <section className={`cs-section ${activeSection === "help" ? "cs-active" : ""}`}>
              <h2 className="cs-section-title">Help Center</h2>
              <div className="cs-faq">
                <div className="cs-did-you-know">
                  <strong>How do I create a new project?</strong>
                  <p>Go to the Dashboard and click the "New Project" button in the top right corner.</p>
                </div>
                <div className="cs-did-you-know">
                  <strong>How do I invite team members?</strong>
                  <p>Navigate to your project, click the "Team" tab, and use the "Invite Member" button.</p>
                </div>
                <div className="cs-did-you-know">
                  <strong>How can I track my project's budget?</strong>
                  <p>Use the "Finances" tab within your project to track expenses and compare with your budget.</p>
                </div>
                <div className="cs-actions">
                  <button className="cs-btn-primary">Contact Support</button>
                </div>
              </div>
            </section>

            {/* LOGOUT is provided in sidebar as <a href="/logout"> */}
          </main>
        </div>
      </div>
    </div>
  );
}
