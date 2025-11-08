// src/pages/company/components/company-settings/components/CustomerProfile.jsx
import React from 'react';

const CustomerProfile = ({
  isVisible,
  isEditing,
  company,
  customerForm,
  onEdit,
  onChange,
  onSubmit,
  onCancel,
  onAddTeamMember,
  onUpdateTeamMember,
  onRemoveTeamMember,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onTeamFileChange,
  onProjectFileChange
}) => {
  if (!isVisible) return null;

  if (!isEditing) {
    return (
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
          <button className="cs-btn-primary" onClick={onEdit}>Edit Customer Profile</button>
        </div>
      </div>
    );
  }

  return (
    <form className="cs-form" onSubmit={onSubmit}>
      <div className="cs-form-row">
        <label>Company Name</label>
        <input className="cs-input" value={customerForm.companyName} readOnly />
      </div>
      <div className="cs-form-row">
        <label>Location</label>
        <input 
          className="cs-input" 
          name="companyLocation" 
          value={customerForm.companyLocation} 
          onChange={onChange} 
        />
      </div>
      <div className="cs-form-row">
        <label>Projects Completed</label>
        <input 
          type="number" 
          className="cs-input" 
          name="projectsCompleted" 
          value={customerForm.projectsCompleted} 
          onChange={(e) => onChange({ 
            target: { name: 'projectsCompleted', value: e.target.value } 
          })} 
        />
      </div>
      <div className="cs-form-row">
        <label>Years in Business</label>
        <input 
          type="number" 
          className="cs-input" 
          name="yearsInBusiness" 
          value={customerForm.yearsInBusiness} 
          onChange={(e) => onChange({ 
            target: { name: 'yearsInBusiness', value: e.target.value } 
          })} 
        />
      </div>
      <div className="cs-form-row">
        <label>About the Company</label>
        <textarea 
          className="cs-textarea" 
          name="customerAboutCompany" 
          value={customerForm.customerAboutCompany} 
          onChange={onChange} 
        />
      </div>
      <div className="cs-form-row">
        <label>Team Members</label>
        <div className="cs-dynamic-list">
          {customerForm.teamMembers.map((member, idx) => (
            <div key={idx} className="cs-dynamic-row cs-team-edit-row">
              <div className="cs-team-edit-left">
                <img 
                  className="cs-team-img" 
                  src={member.image || "https://via.placeholder.com/60"} 
                  alt={member.name || "member"} 
                />
                <input 
                  type="file" 
                  onChange={(e) => onTeamFileChange(e, idx)} 
                />
              </div>
              <div className="cs-team-edit-right">
                <input 
                  className="cs-input" 
                  placeholder="Name" 
                  value={member.name || ""} 
                  onChange={(e) => onUpdateTeamMember(idx, "name", e.target.value)} 
                />
                <input 
                  className="cs-input" 
                  placeholder="Position" 
                  value={member.position || ""} 
                  onChange={(e) => onUpdateTeamMember(idx, "position", e.target.value)} 
                />
                <div className="cs-team-row-actions">
                  <button 
                    type="button" 
                    className="cs-btn-danger" 
                    onClick={() => onRemoveTeamMember(idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div>
            <button 
              type="button" 
              className="cs-btn-secondary" 
              onClick={onAddTeamMember}
            >
              + Add Team Member
            </button>
          </div>
        </div>
      </div>
      <div className="cs-form-row">
        <label>Completed Projects</label>
        <div className="cs-dynamic-list">
          {customerForm.completedProjects.map((proj, idx) => (
            <div key={idx} className="cs-dynamic-row cs-project-edit-row">
              <div className="cs-project-edit-left">
                <img 
                  className="cs-project-img" 
                  src={proj.image || "https://via.placeholder.com/120x80"} 
                  alt={proj.title || "project"} 
                />
                <input 
                  type="file" 
                  onChange={(e) => onProjectFileChange(e, idx)} 
                />
              </div>
              <div className="cs-project-edit-right">
                <input 
                  className="cs-input" 
                  placeholder="Title" 
                  value={proj.title || ""} 
                  onChange={(e) => onUpdateProject(idx, "title", e.target.value)} 
                />
                <textarea 
                  className="cs-textarea" 
                  placeholder="Description" 
                  value={proj.description || ""} 
                  onChange={(e) => onUpdateProject(idx, "description", e.target.value)} 
                />
                <div className="cs-team-row-actions">
                  <button 
                    type="button" 
                    className="cs-btn-danger" 
                    onClick={() => onRemoveProject(idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div>
            <button 
              type="button" 
              className="cs-btn-secondary" 
              onClick={onAddProject}
            >
              + Add Project
            </button>
          </div>
        </div>
      </div>
      <div className="cs-form-row">
        <label>Did You Know?</label>
        <textarea 
          className="cs-textarea" 
          name="didYouKnow" 
          value={customerForm.didYouKnow} 
          onChange={onChange} 
        />
      </div>
      <div className="cs-actions">
        <button 
          type="button" 
          className="cs-btn-secondary" 
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className="cs-btn-primary">Save Changes</button>
      </div>
    </form>
  );
};

export default CustomerProfile;
