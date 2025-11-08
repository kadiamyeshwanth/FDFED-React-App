// CompanySettings.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from 'axios';
import "./CompanySettings.css";
import Sidebar from "./components/Sidebar";
import WorkerProfile from "./components/WorkerProfile";
import CustomerProfile from "./components/CustomerProfile";
import SecuritySection from "./components/SecuritySection";
import HelpCenter from "./components/HelpCenter";

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

  // Security form handlers (local demo only)
  function handleSecurityChange(e) {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));
  }
  function submitSecurity(e) {
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

    // In production, call your API endpoint to change password.
    alert("Password changed (demo). Implement backend call.");
    setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={openSection}
          />

          <main className="cs-content">
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

              <div className={`cs-profile-content ${activeProfileTab === "worker" ? "cs-visible" : ""}`}>
                <WorkerProfile
                  isVisible={activeProfileTab === "worker"}
                  isEditing={editingWorker}
                  company={company}
                  workerForm={workerForm}
                  onEdit={() => setEditingWorker(true)}
                  onChange={handleWorkerChange}
                  onSubmit={submitWorkerProfile}
                  onCancel={() => { setEditingWorker(false); fetchCompany(); }}
                  onAddOpening={addOpening}
                  onUpdateOpening={updateOpening}
                  onRemoveOpening={removeOpening}
                />
              </div>

              <div className={`cs-profile-content ${activeProfileTab === "customer" ? "cs-visible" : ""}`}>
                <CustomerProfile
                  isVisible={activeProfileTab === "customer"}
                  isEditing={editingCustomer}
                  company={company}
                  customerForm={customerForm}
                  onEdit={() => setEditingCustomer(true)}
                  onChange={handleCustomerChange}
                  onSubmit={submitCustomerProfile}
                  onCancel={() => { setEditingCustomer(false); fetchCompany(); }}
                  onAddTeamMember={addTeamMember}
                  onUpdateTeamMember={updateTeamMember}
                  onRemoveTeamMember={removeTeamMember}
                  onAddProject={addProject}
                  onUpdateProject={updateProject}
                  onRemoveProject={removeProject}
                  onTeamFileChange={handleTeamFileChange}
                  onProjectFileChange={handleProjectFileChange}
                />
              </div>
            </section>

            <SecuritySection
              activeSection={activeSection}
              securityForm={securityForm}
              onSecurityChange={handleSecurityChange}
              onSecuritySubmit={submitSecurity}
            />

            <HelpCenter activeSection={activeSection} />
          </main>
        </div>
      </div>
    </div>
  );
}
