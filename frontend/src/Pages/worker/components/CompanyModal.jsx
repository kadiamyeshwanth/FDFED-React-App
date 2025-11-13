import React from 'react'

const CompanyModal = ({ company, onClose, onApply, isEmployed }) => {
  if (!company) return null

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{company.companyName}</h2>
        </div>

        <div className="modal-body">
          <div className="company-details">
            {company.companyLogo && (
              <img
                src={company.companyLogo}
                alt={company.companyName}
                className="company-logo"
              />
            )}
            <div className="company-info">
              <div className="detail-row">
                <div className="detail-label">Location:</div>
                <div className="detail-value">
                  {company.location?.city}, {company.location?.state}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Company Size:</div>
                <div className="detail-value">{company.size}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Years in business:</div>
                <div className="detail-value">{company.yearsInBusiness}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Specializations:</div>
                <div className="detail-value">{company.specialization?.join(', ')}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Current Openings:</div>
                <div className="detail-value">{company.currentOpenings?.join(', ')}</div>
              </div>
            </div>
          </div>

          <div className="company-description">
            <h3>About the Company</h3>
            <p>{company.aboutCompany}</p>
          </div>

          <div className="company-benefits">
            <h3>Why Join Our Team?</h3>
            <p>{company.whyJoinUs}</p>
          </div>
        </div>

        <div className="modal-footer">
          {isEmployed ? (
            <button className="btn btn-primary btn-large" disabled>
              Already Employed
            </button>
          ) : (
            <button className="btn btn-primary btn-large" onClick={onApply}>
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyModal
