import React from 'react'

const RequestsTab = ({ applications }) => {
  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`
  }

  return (
    <>
      <h2>Companies you requested to join</h2>
      <p>Track the status of your applications to join companies</p>

      {applications && applications.length > 0 ? (
        <div className="card-container">
          {applications.map(application => (
            <div key={application._id} className="card">
              <span className={`status-badge ${getStatusClass(application.status)}`}>
                {application.status}
              </span>
              <h3>{application.compName}</h3>
              <p><strong>Position:</strong> {application.positionApplying}</p>
              <p><strong>Location:</strong> {application.location}</p>
              <p>
                <strong>Expected Salary:</strong> ₹{application.expectedSalary?.toLocaleString() || 'N/A'}
              </p>
              <p>
                <strong>Specializations:</strong> {application.primarySkills?.join(', ') || 'N/A'}
              </p>
              <p>
                <strong>Applied On:</strong> {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>You haven't applied to any companies yet.</p>
        </div>
      )}
    </>
  )
}

export default RequestsTab
