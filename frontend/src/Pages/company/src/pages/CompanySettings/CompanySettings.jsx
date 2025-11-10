import React, { useState, useEffect } from 'react';
import NavbarCompany from '../../components/NavbarCompany/NavbarCompany';
import './CompanySettings.css';

const CompanySettings = () => {
  const [company, setCompany] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tagline: '',
    description: '',
    website: '',
    established: '',
    logo: '',
    coverImage: '',
    services: [],
    socialLinks: { facebook: '', linkedin: '', instagram: '' }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [newService, setNewService] = useState({ name: '', description: '', icon: '' });

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/company/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCompany(data);
      } else {
        alert('Failed to load settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCompany(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setCompany(prev => ({ ...prev, [name]: value }));
    }
    validateField(name, value);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'logo') setLogoFile(file);
      else setCoverFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Company name is required';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone is required';
        else if (!/^\d{10}$/.test(value)) error = 'Phone must be 10 digits';
        break;
      case 'established':
        if (!value) error = 'Establishment year is required';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'established'];
    let isValid = true;
    required.forEach(field => {
      if (!validateField(field, company[field])) isValid = false;
    });
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    const formData = new FormData();
    Object.keys(company).forEach(key => {
      if (key === 'services' || key === 'socialLinks') {
        formData.append(key, JSON.stringify(company[key]));
      } else if (key === 'logo' && logoFile) {
        formData.append('logo', logoFile);
      } else if (key === 'coverImage' && coverFile) {
        formData.append('coverImage', coverFile);
      } else if (key !== 'logo' && key !== 'coverImage') {
        formData.append(key, company[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/company/settings', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        alert('Settings saved successfully!');
        setCompany(result.company);
      } else {
        alert(result.message || 'Failed to save');
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    if (!newService.name.trim()) return;
    setCompany(prev => ({
      ...prev,
      services: [...prev.services, { ...newService }]
    }));
    setNewService({ name: '', description: '', icon: '' });
  };

  const removeService = (index) => {
    setCompany(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <>
        <NavbarCompany />
        <div className="loading">Loading settings...</div>
      </>
    );
  }

  return (
    <>
      <NavbarCompany />
      <div className="settings-container">
        <div className="settings-header">
          <h1>Company Settings</h1>
          <p>Manage your company profile, branding, and public information.</p>
        </div>

        <div className="settings-content">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={activeTab === 'general' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={activeTab === 'branding' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('branding')}
            >
              Branding
            </button>
            <button
              className={activeTab === 'services' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
            <button
              className={activeTab === 'social' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('social')}
            >
              Social Links
            </button>
          </div>

          <div className="tab-content">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="form-section">
                <h2>Company Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={company.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'input-error' : ''}
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={company.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'input-error' : ''}
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      value={company.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'input-error' : ''}
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={company.address}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={company.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Established Year *</label>
                    <input
                      type="number"
                      name="established"
                      value={company.established}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className={errors.established ? 'input-error' : ''}
                    />
                    {errors.established && <span className="error">{errors.established}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="form-section">
                <h2>Branding</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company Logo</label>
                    <div className="file-upload">
                      {company.logo && (
                        <div className="image-preview">
                          <img src={company.logo} alt="Logo" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'logo')}
                      />
                      <small>Recommended: 300x300px, PNG/JPG</small>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Cover Image</label>
                    <div className="file-upload">
                      {company.coverImage && (
                        <div className="image-preview wide">
                          <img src={company.coverImage} alt="Cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'coverImage')}
                      />
                      <small>Recommended: 1600x600px, JPG/PNG</small>
                    </div>
                  </div>
                  <div className="form-group full">
                    <label>Tagline</label>
                    <input
                      type="text"
                      name="tagline"
                      value={company.tagline}
                      onChange={handleInputChange}
                      placeholder="e.g., Building Excellence Since 2005"
                    />
                  </div>
                  <div className="form-group full">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={company.description}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Tell us about your company..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="form-section">
                <h2>Services Offered</h2>
                <div className="services-list">
                  {company.services.length === 0 ? (
                    <p className="no-data">No services added yet.</p>
                  ) : (
                    company.services.map((service, i) => (
                      <div key={i} className="service-item">
                        <div className="service-icon">{service.icon || 'Tool'}</div>
                        <div className="service-details">
                          <h4>{service.name}</h4>
                          <p>{service.description}</p>
                        </div>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeService(i)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="add-service">
                  <h3>Add New Service</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Service Name</label>
                      <input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Residential Construction"
                      />
                    </div>
                    <div className="form-group">
                      <label>Icon (Emoji)</label>
                      <input
                        type="text"
                        value={newService.icon}
                        onChange={(e) => setNewService(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="e.g., House"
                        maxLength="2"
                      />
                    </div>
                    <div className="form-group full">
                      <label>Description</label>
                      <textarea
                        value={newService.description}
                        onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                        rows="2"
                        placeholder="Brief description of the service..."
                      />
                    </div>
                    <button type="button" className="btn-add-service" onClick={addService}>
                      Add Service
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="form-section">
                <h2>Social Media Links</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      name="socialLinks.facebook"
                      value={company.socialLinks.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/yourcompany"
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={company.socialLinks.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      name="socialLinks.instagram"
                      value={company.socialLinks.instagram}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/yourcompany"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="save-actions">
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanySettings;