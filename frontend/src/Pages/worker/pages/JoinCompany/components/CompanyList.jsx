import React from 'react'

const CompanyList = ({ companies, onViewDetails, onApplyNow, isEmployed }) => {
  return (
    <div className="card-container">
      {companies && companies.length > 0 ? (
        companies.map(company => (
          <div key={company._id} className="card">
            <h3>{company.companyName}</h3>
            <p><strong>Location:</strong> {company.location?.city || 'N/A'}</p>
            <p><strong>Company Size:</strong> {company.size || 'N/A'}</p>
            <p>
              <strong>Project types:</strong> {company.specialization?.join(', ') || 'N/A'}
            </p>
            <p>
              <strong>Looking for:</strong> {company.currentOpenings?.join(', ') || 'N/A'}
            </p>
            {company.badges && company.badges.length > 0 && (
              <div>
                {company.badges.map((badge, idx) => (
                  <span key={idx} className={`badge ${badge.class || 'badge-green'}`}>
                    {badge.text || badge}
                  </span>
                ))}
              </div>
            )}
            <div className="card-footer">
              <button
                className="btn btn-primary"
                onClick={() => onViewDetails(company)}
              >
                View Details
              </button>
              {isEmployed ? (
                <button
                  className="btn btn-primary"
                  disabled
                  title="You are already employed by a company."
                >
                  Apply Now
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => onApplyNow(company)}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <p>No companies available at this time.</p>
        </div>
      )}
    </div>
  )
}

export default CompanyList
