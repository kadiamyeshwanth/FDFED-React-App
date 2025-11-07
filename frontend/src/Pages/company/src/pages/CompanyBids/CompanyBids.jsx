import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarCompany from '../../components/NavbarCompany/NavbarCompany';
import './CompanyBids.css';

const CompanyBids = () => {
  const [bids, setBids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  const bidsPerPage = 10;

  // Fetch bids
  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bids/company', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBids(data);
      } else {
        alert('Failed to load bids');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading bids');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search
  const filteredBids = bids.filter(bid => {
    const matchesSearch =
      bid.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.projectAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.contractorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || bid.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLast = currentPage * bidsPerPage;
  const indexOfFirst = indexOfLast - bidsPerPage;
  const currentBids = filteredBids.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBids.length / bidsPerPage);

  const paginate = (page) => setCurrentPage(page);

  const openBidModal = (bid) => {
    setSelectedBid(bid);
    setShowBidModal(true);
  };

  const closeBidModal = () => {
    setShowBidModal(false);
    setSelectedBid(null);
  };

  // Accept Bid
  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to accept this bid?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bids/${bidId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBids(prev => prev.map(b => b._id === bidId ? { ...b, status: 'accepted' } : b));
        alert('Bid accepted successfully');
        closeBidModal();
      } else {
        alert('Failed to accept bid');
      }
    } catch (err) {
      alert('Error accepting bid');
    }
  };

  // Reject Bid
  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to reject this bid?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bids/${bidId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBids(prev => prev.map(b => b._id === bidId ? { ...b, status: 'rejected' } : b));
        alert('Bid rejected');
        closeBidModal();
      } else {
        alert('Failed to reject bid');
      }
    } catch (err) {
      alert('Error rejecting bid');
    }
  };

  if (loading) return <div className="loading">Loading bids...</div>;

  return (
    <>
      <NavbarCompany />
      <div className="bids-container">
        <div className="bids-header">
          <h1>My Project Bids</h1>
          <Link to="/project_requests" className="btn-add">
            View Project Requests
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by project, address, contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Bids Table */}
        <div className="table-container">
          {currentBids.length === 0 ? (
            <p className="no-data">No bids found.</p>
          ) : (
            <table className="bids-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Contractor</th>
                  <th>Bid Amount</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBids.map(bid => (
                  <tr key={bid._id}>
                    <td>
                      <div>
                        <strong>{bid.projectName}</strong>
                        <small>{bid.projectAddress}</small>
                      </div>
                    </td>
                    <td>{bid.contractorName}</td>
                    <td>₹{parseFloat(bid.bidAmount).toLocaleString('en-IN')}</td>
                    <td>{bid.timeline} months</td>
                    <td>
                      <span className={`status-badge ${bid.status}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn-view" onClick={() => openBidModal(bid)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bid Details Modal */}
      {showBidModal && selectedBid && (
        <div className="modal-overlay" onClick={closeBidModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bid Details</h2>
              <button className="close-btn" onClick={closeBidModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="bid-info">
                <h3>Project</h3>
                <p><strong>{selectedBid.projectName}</strong></p>
                <p>{selectedBid.projectAddress}</p>
              </div>

              <div className="bid-info">
                <h3>Contractor</h3>
                <p>{selectedBid.contractorName}</p>
                <p>{selectedBid.contractorEmail}</p>
              </div>

              <div className="bid-info">
                <h3>Bid Details</h3>
                <p><strong>Amount:</strong> ₹{parseFloat(selectedBid.bidAmount).toLocaleString('en-IN')}</p>
                <p><strong>Timeline:</strong> {selectedBid.timeline} months</p>
                <p><strong>Submitted:</strong> {new Date(selectedBid.submittedAt).toLocaleDateString('en-IN')}</p>
              </div>

              {selectedBid.scopeOfWork && (
                <div className="bid-info">
                  <h3>Scope of Work</h3>
                  <p>{selectedBid.scopeOfWork}</p>
                </div>
              )}

              {selectedBid.attachments && selectedBid.attachments.length > 0 && (
                <div className="bid-info">
                  <h3>Attachments</h3>
                  <div className="attachments">
                    {selectedBid.attachments.map((file, i) => (
                      <a key={i} href={file} target="_blank" rel="noopener noreferrer" className="attachment-link">
                        Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="bid-info">
                <h3>Status</h3>
                <span className={`status-badge large ${selectedBid.status}`}>
                  {selectedBid.status.charAt(0).toUpperCase() + selectedBid.status.slice(1)}
                </span>
              </div>
            </div>

            {selectedBid.status === 'pending' && (
              <div className="modal-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAcceptBid(selectedBid._id)}
                >
                  Accept Bid
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleRejectBid(selectedBid._id)}
                >
                  Reject Bid
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyBids;