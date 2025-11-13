import React, { useState } from 'react'

const JobDetails = ({ job, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  if (!job) return (
    <section className="job-details-panel">
      <div className="empty-state">
        <h2>No Job Selected</h2>
        <p>Click on a job offer from the list to view its details</p>
      </div>
    </section>
  )

  const id = job._id || job.id
  const type = job.type || 'architect'

  async function updateStatus(status) {
    try {
      const res = await fetch(`/jobs/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status === 'accept' ? 'Accepted' : 'Rejected', type: type })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      alert(data.message || 'Success')
      onChange && onChange()
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
    }
  }

  async function submitProposal(e) {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append('projectId', id)
      form.append('projectType', type === 'architect' ? 'architect' : 'interior')
      form.append('price', price)
      form.append('description', description)

      const res = await fetch('/worker/submit-proposal', { method: 'POST', body: form })
      // server redirects on success; treat any ok as success
      if (!res.ok) throw new Error('Failed to submit proposal')
      alert('Proposal submitted')
      setModalOpen(false)
      onChange && onChange()
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <section className="job-details-panel">
      <div className="details-header">
        <div className="details-header-left">
          <h2>{job.projectName || job.projectName || job.projectName || job.fullName || 'Job Details'}</h2>
          <span className={`job-type ${type}`}>{(job.designRequirements && job.designRequirements.designType) || job.roomType || type}</span>
          <p className="job-budget">₹{job.additionalDetails?.budget || job.budget || ''}</p>
        </div>
        <div className="details-header-right">
          <p className="detail-label">Status</p>
          <p className="detail-value">{job.status || 'N/A'}</p>
        </div>
      </div>

      <div className="details-section">
        <h3>Customer Details</h3>
        <div className="details-grid">
          <div className="detail-item"><p className="detail-label">Name</p><p className="detail-value">{job.customerDetails?.fullName || job.customerId?.name || 'N/A'}</p></div>
          <div className="detail-item"><p className="detail-label">Contact</p><p className="detail-value">{job.customerDetails?.contactNumber || job.customerId?.phone || 'N/A'}</p></div>
          <div className="detail-item"><p className="detail-label">Email</p><p className="detail-value">{job.customerDetails?.email || job.customerId?.email || 'N/A'}</p></div>
        </div>
      </div>

      <div className="job-action-buttons">
        {job.status && (job.status === 'Pending' || job.status === 'pending' || job.status === 'proposal_sent') && (
          <>
            <button className="job-action-button accept-button" onClick={() => setModalOpen(true)}>Create Proposal</button>
            <button className="job-action-button deny-button" onClick={() => { if (confirm('Deny this job?')) updateStatus('reject') }}>Deny Job</button>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setModalOpen(false)}>&times;</span>
            <div className="modal-header"><h2>Create Proposal</h2></div>
            <div className="modal-body">
              <form onSubmit={submitProposal}>
                <div className="form-group">
                  <label>Project Price (₹)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description of Services</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
                </div>
                <button type="submit" className="job-action-button accept-button">Submit Proposal</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default JobDetails
