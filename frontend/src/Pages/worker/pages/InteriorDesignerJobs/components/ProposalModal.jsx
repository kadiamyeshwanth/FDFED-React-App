import React, { useState } from 'react';

const ProposalModal = ({ isOpen, onClose, onSubmit, projectId }) => {
  const [formData, setFormData] = useState({
    price: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.price || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        projectId,
        price: formData.price,
        description: formData.description
      });
      setFormData({ price: '', description: '' });
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>
          &times;
        </span>

        <div className="modal-header">
          <h2>Create Proposal</h2>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="proposalPrice">Project Price (₹)</label>
              <input
                type="number"
                id="proposalPrice"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="Enter your quote"
              />
            </div>

            <div className="form-group">
              <label htmlFor="proposalDescription">Description of Services</label>
              <textarea
                id="proposalDescription"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                placeholder="e.g., Full interior design concept for one living room, including mood board and furniture selection."
              />
            </div>

            <button
              type="submit"
              className="job-action-button accept-button"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
