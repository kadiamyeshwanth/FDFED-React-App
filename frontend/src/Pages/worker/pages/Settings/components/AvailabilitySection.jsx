import React, { useState, useEffect } from 'react';

const AvailabilitySection = ({ worker, onAvailabilityUpdate }) => {
  const [availability, setAvailability] = useState(worker.availability || 'available');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    setAvailability(worker.availability || 'available');
  }, [worker]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/worker/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ availability })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Availability updated successfully!');
        setMessageType('success');
        if (onAvailabilityUpdate) {
          onAvailabilityUpdate();
        }
      } else {
        setMessage(data.message || 'Failed to update availability.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="availability-content">
      <h2>Availability Status</h2>
      <p className="availability-description">Set your current availability for new projects</p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="availability-status">Select your availability:</label>
          <select
            id="availability-status"
            className="form-control"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            disabled={loading}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Availability'}
        </button>
      </form>

      <div className="availability-info">
        <h4>What does this mean?</h4>
        <ul>
          <li><strong>Available:</strong> You are open to new projects and opportunities</li>
          <li><strong>Busy:</strong> You are currently working on projects but might consider new ones</li>
          <li><strong>Unavailable:</strong> You are not taking any new projects at this time</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilitySection;
