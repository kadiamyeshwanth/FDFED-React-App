import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import './RevenueForm.css';


const RevenueForm = () => {
  const { id } = useParams(); // Revenue ID for editing
  const history = useHistory();

  const [formData, setFormData] = useState({
    projectName: '',
    projectAddress: '',
    clientName: '',
    clientContact: '',
    totalContractValue: '',
    paymentsReceived: '',
    pendingAmount: '',
    paymentTerms: '',
    paymentSchedule: '',
    revenueRecognition: '',
    revenueEntries: [],
    newEntry: { date: '', amount: '', description: '' },
    progressPercentage: 0,
    status: 'ongoing',
    documents: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validationSummary, setValidationSummary] = useState([]);

  useEffect(() => {
    if (id) {
      fetchRevenue();
    }
  }, [id]);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/revenue/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const totalReceived = data.revenueEntries.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const pending = parseFloat(data.totalContractValue || 0) - totalReceived;
        const progress = data.totalContractValue > 0
          ? Math.round((totalReceived / data.totalContractValue) * 100)
          : 0;

        setFormData({
          ...data,
          paymentsReceived: totalReceived.toFixed(2),
          pendingAmount: pending > 0 ? pending.toFixed(2) : '0.00',
          progressPercentage: progress,
          revenueEntries: data.revenueEntries || [],
          documents: data.documents || []
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
    let updated = { ...formData, [name]: value };

    if (name === 'totalContractValue' || name === 'paymentsReceived') {
      const total = parseFloat(updated.totalContractValue || 0);
      const received = parseFloat(updated.paymentsReceived || 0);
      updated.pendingAmount = total > received ? (total - received).toFixed(2) : '0.00';
      updated.progressPercentage = total > 0 ? Math.round((received / total) * 100) : 0;
    }

    setFormData(updated);
    validateField(name, value);
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      newEntry: { ...prev.newEntry, [name]: value }
    }));
    validateField(`newEntry.${name}`, value);
  };

  const addRevenueEntry = () => {
    const { date, amount, description } = formData.newEntry;
    if (!date || !amount || amount <= 0) return;

    const newEntry = {
      date,
      amount: parseFloat(amount).toFixed(2),
      description: description.trim()
    };

    const updatedEntries = [...formData.revenueEntries, newEntry];
    const totalReceived = updatedEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const total = parseFloat(formData.totalContractValue || 0);
    const pending = total > totalReceived ? (total - totalReceived).toFixed(2) : '0.00';
    const progress = total > 0 ? Math.round((totalReceived / total) * 100) : 0;

    setFormData(prev => ({
      ...prev,
      revenueEntries: updatedEntries,
      paymentsReceived: totalReceived.toFixed(2),
      pendingAmount: pending,
      progressPercentage: progress,
      newEntry: { date: '', amount: '', description: '' }
    }));
  };

  const removeEntry = (index) => {
    const updated = formData.revenueEntries.filter((_, i) => i !== index);
    const totalReceived = updated.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const total = parseFloat(formData.totalContractValue || 0);
    const pending = total > totalReceived ? (total - totalReceived).toFixed(2) : '0.00';
    const progress = total > 0 ? Math.round((totalReceived / total) * 100) : 0;

    setFormData(prev => ({
      ...prev,
      revenueEntries: updated,
      paymentsReceived: totalReceived.toFixed(2),
      pendingAmount: pending,
      progressPercentage: progress
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateField = (name, value) => {
    let error = '';
    const field = name.split('.').pop();

    switch (field) {
      case 'projectName':
      case 'clientName':
        if (!value.trim()) error = `${field.replace(/([A-Z])/g, ' $1')} is required`;
        break;
      case 'totalContractValue':
      case 'paymentsReceived':
        if (!value || isNaN(value) || value < 0) error = 'Valid amount is required';
        break;
      case 'date':
        if (!value) error = 'Date is required';
        break;
      case 'amount':
        if (!value || isNaN(value) || value <= 0) error = 'Amount must be greater than 0';
        break;
      default:
        break;
    }

    const errorKey = name.includes('.') ? name.split('.')[1] : name;
    setErrors(prev => ({ ...prev, [errorKey]: error }));
    return !error;
  };

  const validateForm = () => {
    const required = ['projectName', 'clientName', 'totalContractValue'];
    const errorsList = [];
    let isValid = true;

    required.forEach(field => {
      const valid = validateField(field, formData[field]);
      if (!valid) {
        isValid = false;
        errorsList.push(errors[field]);
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
      if (key === 'documents') {
        formData.documents.forEach(file => submitData.append('documents', file));
      } else if (key === 'revenueEntries') {
        submitData.append('revenueEntries', JSON.stringify(formData.revenueEntries));
      } else if (key !== 'newEntry') {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(id ? `/api/revenue/${id}` : '/api/revenue', {
        method: id ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        history.push('/companyrevenue');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div className="loading">Loading revenue record...</div>;

  return (
    <div className="container">
      <h1>{id ? 'Edit Revenue Record' : 'Add New Revenue'}</h1>

      {validationSummary.length > 0 && (
        <div className="validation-summary">
          <p>Please correct the following errors:</p>
          <ul>
            {validationSummary.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Project Details */}
        <div className="form-group">
          <label>Project Name</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            className={errors.projectName ? 'input-error' : ''}
            required
          />
          {errors.projectName && <span className="error-message">{errors.projectName}</span>}
        </div>

        <div className="form-group">
          <label>Project Address</label>
          <textarea
            name="projectAddress"
            value={formData.projectAddress}
            onChange={handleInputChange}
            rows="2"
          />
        </div>

        {/* Client Details */}
        <div className="form-group">
          <label>Client Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            className={errors.clientName ? 'input-error' : ''}
            required
          />
          {errors.clientName && <span className="error-message">{errors.clientName}</span>}
        </div>

        <div className="form-group">
          <label>Client Contact</label>
          <input
            type="text"
            name="clientContact"
            value={formData.clientContact}
            onChange={handleInputChange}
          />
        </div>

        {/* Financial Summary */}
        <div className="form-row">
          <div className="form-group half">
            <label>Total Contract Value (₹)</label>
            <input
              type="number"
              name="totalContractValue"
              value={formData.totalContractValue}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={errors.totalContractValue ? 'input-error' : ''}
              required
            />
            {errors.totalContractValue && <span className="error-message">{errors.totalContractValue}</span>}
          </div>

          <div className="form-group half">
            <label>Payments Received (₹)</label>
            <input
              type="number"
              name="paymentsReceived"
              value={formData.paymentsReceived}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              readOnly
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half">
            <label>Pending Amount (₹)</label>
            <input
              type="text"
              value={formData.pendingAmount}
              readOnly
              className="readonly"
            />
          </div>

          <div className="form-group half">
            <label>Progress</label>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${formData.progressPercentage}%` }}
                ></div>
              </div>
              <span className="progress-value">{formData.progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="form-group">
          <label>Payment Terms</label>
          <textarea
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleInputChange}
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Payment Schedule</label>
          <textarea
            name="paymentSchedule"
            value={formData.paymentSchedule}
            onChange={handleInputChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Revenue Recognition Method</label>
          <select
            name="revenueRecognition"
            value={formData.revenueRecognition}
            onChange={handleInputChange}
          >
            <option value="">Select Method</option>
            <option value="percentage-completion">Percentage of Completion</option>
            <option value="completed-contract">Completed Contract</option>
            <option value="installment">Installment</option>
          </select>
        </div>

        {/* Revenue Entries */}
        <div className="form-group">
          <label>Revenue Entries</label>
          <div className="entries-list">
            {formData.revenueEntries.length === 0 ? (
              <p className="no-entries">No revenue entries added yet.</p>
            ) : (
              formData.revenueEntries.map((entry, i) => (
                <div key={i} className="entry-item">
                  <div>
                    <strong>{entry.date}</strong> - ₹{entry.amount}
                    {entry.description && <><br /><small>{entry.description}</small></>}
                  </div>
                  <button type="button" onClick={() => removeEntry(i)} className="remove-btn">×</button>
                </div>
              ))
            )}
          </div>

          <div className="entry-input">
            <div className="form-row">
              <input
                type="date"
                name="date"
                value={formData.newEntry.date}
                onChange={handleNewEntryChange}
                className={errors.date ? 'input-error' : ''}
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.newEntry.amount}
                onChange={handleNewEntryChange}
                min="0.01"
                step="0.01"
                className={errors.amount ? 'input-error' : ''}
              />
              <input
                type="text"
                name="description"
                placeholder="Description (optional)"
                value={formData.newEntry.description}
                onChange={handleNewEntryChange}
              />
              <button type="button" onClick={addRevenueEntry} className="btn btn-secondary small">Add</button>
            </div>
            {(errors.date || errors.amount) && (
              <span className="error-message">{errors.date || errors.amount}</span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="form-group">
          <label>Status</label>
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
                value="delayed"
                checked={formData.status === 'delayed'}
                onChange={handleInputChange}
              />
              Delayed
            </label>
          </div>
        </div>

        {/* Documents */}
        <div className="form-group">
          <label>Supporting Documents</label>
          <input type="file" multiple onChange={handleFileChange} />
          <div className="file-preview">
            {formData.documents.map((file, i) => (
              <div key={i} className="file-item">
                <span>{typeof file === 'string' ? file.split('/').pop() : file.name}</span>
                <button type="button" onClick={() => removeDocument(i)} className="remove-btn">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="btn-container">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Revenue Record'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => history.push('/companyrevenue')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RevenueForm;