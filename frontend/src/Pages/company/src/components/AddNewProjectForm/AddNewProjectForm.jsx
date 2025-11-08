import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import './AddNewProjectForm.css';

const AddNewProjectForm = () => {
  const { id } = useParams(); // Project ID for editing
  const history = useHistory();

  const [formData, setFormData] = useState({
    projectName: '',
    projectAddress: '',
    buildingType: 'residential',
    estimatedBudget: '',
    timeline: '',
    startDate: '',
    completionPercentage: 0,
    specialRequirements: '',
    status: 'ongoing',
    updates: [],
    newUpdate: '',
    progressImages: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validationSummary, setValidationSummary] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({
          ...data,
          updates: data.updates || [],
          progressImages: data.progressImages || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      progressImages: [...prev.progressImages, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      progressImages: prev.progressImages.filter((_, i) => i !== index)
    }));
  };

  const addUpdate = () => {
    if (formData.newUpdate.trim()) {
      setFormData(prev => ({
        ...prev,
        updates: [...prev.updates, {
          text: prev.newUpdate,
          date: new Date().toLocaleDateString('en-IN')
        }],
        newUpdate: ''
      }));
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'projectName':
        if (!value.trim()) error = 'Project name is required';
        break;
      case 'projectAddress':
        if (!value.trim()) error = 'Address is required';
        break;
      case 'estimatedBudget':
        if (!value || isNaN(value) || value <= 0) error = 'Valid budget is required';
        break;
      case 'timeline':
        if (!value || value <= 0) error = 'Timeline must be greater than 0';
        break;
      case 'startDate':
        if (!value) error = 'Start date is required';
        break;
      case 'newUpdate':
        if (value.length > 500) error = 'Update cannot exceed 500 characters';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['projectName', 'projectAddress', 'estimatedBudget', 'timeline', 'startDate'];
    const errorsList = [];
    let isValid = true;

    fields.forEach(field => {
      const valid = validateField(field, formData[field]);
      if (!valid) {
        isValid = false;
        errorsList.push(errors[field] || `${field} is invalid`);
      }
    });

    if (!isValid) {
      setValidationSummary(errorsList);
    } else {
      setValidationSummary([]);
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'progressImages') {
        formData.progressImages.forEach((file, i) => {
          submitData.append('progressImages', file);
        });
      } else if (key === 'updates') {
        submitData.append('updates', JSON.stringify(formData.updates));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(id ? `/api/projects/${id}` : '/api/projects', {
        method: id ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        history.push('/companyongoing_projects');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div className="loading">Loading project...</div>;

  return (
    <div className="container">
      <h1>Edit Construction Project</h1>

      {validationSummary.length > 0 && (
        <div id="validationSummary" className="validation-summary">
          <p>Please correct the following errors:</p>
          <ul id="validationList">
            {validationSummary.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form id="constructionProjectForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            className={errors.projectName ? 'input-error' : ''}
            required
          />
          {errors.projectName && <span className="error-message">{errors.projectName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="projectAddress">Project Address</label>
          <textarea
            id="projectAddress"
            name="projectAddress"
            value={formData.projectAddress}
            onChange={handleInputChange}
            rows="3"
            required
          />
          {errors.projectAddress && <span className="error-message">{errors.projectAddress}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="buildingType">Building Type</label>
          <select
            id="buildingType"
            name="buildingType"
            value={formData.buildingType}
            onChange={handleInputChange}
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="institutional">Institutional</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estimatedBudget">Estimated Budget (₹)</label>
          <input
            type="number"
            id="estimatedBudget"
            name="estimatedBudget"
            value={formData.estimatedBudget}
            onChange={handleInputChange}
            min="1"
            required
          />
          {errors.estimatedBudget && <span className="error-message">{errors.estimatedBudget}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="timeline">Timeline (Months)</label>
          <input
            type="number"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleInputChange}
            min="1"
            required
          />
          {errors.timeline && <span className="error-message">{errors.timeline}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="completionPercentage">Completion Percentage</label>
          <div className="progress-container">
            <div className="progress-input">
              <input
                type="range"
                id="completionPercentage"
                name="completionPercentage"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={handleInputChange}
              />
              <span className="progress-value">{formData.completionPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${formData.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="specialRequirements">Special Requirements</label>
          <textarea
            id="specialRequirements"
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Project Status</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="status"
                value="ongoing"
                checked={formData.status === 'ongoing'}
                onChange={handleInputChange}
              />
              Ongoing
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="completed"
                checked={formData.status === 'completed'}
                onChange={handleInputChange}
              />
              Completed
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="on-hold"
                checked={formData.status === 'on-hold'}
                onChange={handleInputChange}
              />
              On Hold
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Progress Updates</label>
          {formData.updates.map((update, i) => (
            <div key={i} className="update-container">
              <p><strong>{update.date}:</strong> {update.text}</p>
            </div>
          ))}
          <div className="update-input">
            <textarea
              id="update1"
              name="newUpdate"
              value={formData.newUpdate}
              onChange={handleInputChange}
              placeholder="Add new update..."
              rows="3"
            />
            {errors.newUpdate && <span className="error-message" id="update1Error">{errors.newUpdate}</span>}
            <button type="button" onClick={addUpdate} className="btn btn-secondary">Add Update</button>
          </div>
        </div>

        <div className="form-group">
          <label>Progress Images</label>
          <div className="image-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="image-preview">
            {formData.progressImages.map((file, i) => (
              <div key={i} className="image-item">
                <img
                  src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                  alt={`Progress ${i + 1}`}
                />
                <button type="button" onClick={() => removeImage(i)} className="remove-btn">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="btn-container">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Project'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => history.push('/companyongoing_projects')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewProjectForm;