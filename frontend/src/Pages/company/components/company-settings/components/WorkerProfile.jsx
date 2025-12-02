// src/pages/company/components/company-settings/components/WorkerProfile.jsx
import React from 'react';

const WorkerProfile = ({
  isVisible,
  isEditing,
  company,
  workerForm,
  onEdit,
  onChange,
  onSubmit,
  onCancel,
  onAddOpening,
  onUpdateOpening,
  onRemoveOpening
}) => {
  if (!isVisible) return null;

  if (!isEditing) {
    return (
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
          <button className="cs-btn-primary" onClick={onEdit}>Edit Worker Profile</button>
        </div>
      </div>
    );
  }

  return (
    <form className="cs-form" onSubmit={onSubmit}>
      <div className="cs-form-row">
        <label>Company Name</label>
        <input 
          type="text" 
          className="cs-input" 
          name="companyName" 
          value={workerForm.companyName} 
          readOnly 
        />
      </div>
      <div className="cs-form-row">
        <label>Location</label>
        <input 
          className="cs-input" 
          name="companyLocation" 
          value={workerForm.companyLocation} 
          onChange={onChange} 
          required 
        />
      </div>
      <div className="cs-form-row">
        <label>Company Size</label>
        <select 
          name="companySize" 
          className="cs-input" 
          value={workerForm.companySize} 
          onChange={onChange} 
          required
        >
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
        <input 
          className="cs-input" 
          name="specializations" 
          value={workerForm.specializations} 
          onChange={onChange} 
        />
      </div>
      <div className="cs-form-row">
        <label>Current Openings</label>
        <div className="cs-dynamic-list">
          {workerForm.currentOpenings.map((op, i) => (
            <div key={i} className="cs-dynamic-row">
              <input 
                className="cs-input" 
                value={op} 
                onChange={(e) => onUpdateOpening(i, e.target.value)} 
              />
              <button 
                type="button" 
                className="cs-btn-danger" 
                onClick={() => onRemoveOpening(i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button 
            type="button" 
            className="cs-btn-secondary" 
            onClick={onAddOpening}
          >
            + Add Opening
          </button>
        </div>
      </div>
      <div className="cs-form-row">
        <label>About the Company</label>
        <textarea 
          className="cs-textarea" 
          name="aboutCompany" 
          value={workerForm.aboutCompany} 
          onChange={onChange} 
        />
      </div>
      <div className="cs-form-row">
        <label>Why Join Our Team?</label>
        <textarea 
          className="cs-textarea" 
          name="whyJoinUs" 
          value={workerForm.whyJoinUs} 
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

export default WorkerProfile;
