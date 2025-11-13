import React from 'react'

const OffersTab = ({ offers, onAccept, onDecline }) => {
  return (
    <>
      <h2>Your Current Offers</h2>
      <p>Companies that have invited you to join their team</p>

      {offers && offers.length > 0 ? (
        <div className="card-container">
          {offers.map(offer => (
            <div key={offer._id} className="card">
              <h3>{offer.company?.companyName || 'Company Name'}</h3>
              <p><strong>Position:</strong> {offer.position}</p>
              <p><strong>Location:</strong> {offer.location}</p>
              <p>
                <strong>Salary Range:</strong> ₹{offer.salary?.toLocaleString('en-IN') || 'N/A'}
              </p>
              <div className="card-footer">
                <button 
                  className="btn btn-outline"
                  onClick={() => onDecline(offer._id)}
                >
                  Decline
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => onAccept(offer._id)}
                >
                  Accept Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No Offers Yet</h3>
          <p>
            You don't have any offers at the moment. Continue applying to companies and showcasing your skills!
          </p>
        </div>
      )}
    </>
  )
}

export default OffersTab
