import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyHeader = ({ company, chatId, onLeaveCompany }) => {
  const navigate = useNavigate();

  const handleChat = () => {
    if (chatId) {
      navigate(`/chat/${chatId}`);
    } else {
      alert('Chat ID not available');
    }
  };

  return (
    <div className="company-header">
      <div className="company-header-info">
        <h1>{company.companyName}</h1>
        <p className="location">
          <i className="fas fa-map-marker-alt"></i> {company.location?.city || 'Not specified'}
        </p>
        <div className="company-details">
          <p>
            <strong>Industry:</strong> {company.specialization?.join(', ') || 'General'}
          </p>
          <p>
            <strong>Size:</strong> {company.size || 'Not specified'}
          </p>
          <p>
            <strong>About:</strong> {company.aboutCompany || 'No description available'}
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button onClick={handleChat} className="btn btn-chat">
          <i className="fas fa-comment-dots"></i> Chat with Company
        </button>
        <button onClick={onLeaveCompany} className="btn btn-leave">
          <i className="fas fa-sign-out-alt"></i> Leave Company
        </button>
      </div>
    </div>
  );
};

export default CompanyHeader;
