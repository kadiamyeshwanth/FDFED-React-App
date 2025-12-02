// src/pages/company/components/company-settings/components/SecuritySection.jsx
import React from 'react';

const SecuritySection = ({ 
  activeSection, 
  securityForm, 
  onSecurityChange, 
  onSecuritySubmit 
}) => {
  if (activeSection !== "security") return null;

  return (
    <section className="cs-section cs-active">
      <h2 className="cs-section-title">Security Settings</h2>
      <form className="cs-form" onSubmit={onSecuritySubmit}>
        <div className="cs-form-row">
          <label>Current Password</label>
          <input 
            type="password" 
            name="currentPassword" 
            className="cs-input" 
            value={securityForm.currentPassword} 
            onChange={onSecurityChange} 
            required 
          />
        </div>
        <div className="cs-form-row">
          <label>New Password</label>
          <input 
            type="password" 
            name="newPassword" 
            className="cs-input" 
            value={securityForm.newPassword} 
            onChange={onSecurityChange} 
            required 
          />
        </div>
        <div className="cs-form-row">
          <label>Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword" 
            className="cs-input" 
            value={securityForm.confirmPassword} 
            onChange={onSecurityChange} 
            required 
          />
        </div>
        <div className="cs-actions">
          <button type="submit" className="cs-btn-primary">Update Password</button>
        </div>
      </form>
    </section>
  );
};

export default SecuritySection;
