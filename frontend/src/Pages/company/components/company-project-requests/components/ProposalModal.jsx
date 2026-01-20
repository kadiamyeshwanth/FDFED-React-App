// src/pages/company/components/company-project-requests/components/ProposalModal.jsx
import React, { useState, useEffect } from 'react';

// Predefined work categories for subdivisions
const WORK_CATEGORIES = [
  { id: 'excavation', name: 'Excavation' },
  { id: 'foundation', name: 'Foundation Work' },
  { id: 'flooring', name: 'Flooring' },
  { id: 'brickwork', name: 'Brickwork / Masonry' },
  { id: 'plastering', name: 'Plastering' },
  { id: 'electrical', name: 'Electrical Wiring' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'roofing', name: 'Roofing' },
  { id: 'painting', name: 'Painting' },
  { id: 'tiling', name: 'Tiling' },
  { id: 'doors_windows', name: 'Doors & Windows' },
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'waterproofing', name: 'Waterproofing' },
  { id: 'finishing', name: 'Finishing Work' },
  { id: 'other', name: 'Other' }
];

const MAX_PHASES = 5;
const MAX_PERCENTAGE_PER_PHASE = 20;

const ProposalModal = ({ 
  isOpen, 
  onClose, 
  project,
  proposalData,
  proposalErrors,
  maxBudget,
  onProposalChange,
  onSubmitProposal
}) => {
  const [phases, setPhases] = useState([
    { 
      id: 1, 
      name: 'Phase 1', 
      percentage: 0, 
      completionDate: '', 
      subdivisions: [
        { id: 1, category: '', description: '', amount: 0 }
      ]
    },
    { 
      id: 'finishing', 
      name: 'Finishing Touches & Completion', 
      percentage: 100, 
      completionDate: '', 
      isFixed: true
    }
  ]);
  const [phaseErrors, setPhaseErrors] = useState({});
  const [nextPhaseId, setNextPhaseId] = useState(2);

  // Calculate remaining percentage for finishing phase
  const getRemainingPercentage = () => {
    const otherPhasesTotal = phases
      .filter(p => !p.isFixed)
      .reduce((sum, phase) => sum + (parseFloat(phase.percentage) || 0), 0);
    return Math.max(0, 100 - otherPhasesTotal);
  };

  // Update finishing phase percentage automatically
  React.useEffect(() => {
    const remaining = getRemainingPercentage();
    setPhases(prevPhases => 
      prevPhases.map(phase => 
        phase.isFixed ? { ...phase, percentage: remaining } : phase
      )
    );
  }, [phases.filter(p => !p.isFixed).map(p => p.percentage).join(',')]);

  // Calculate total amount for a phase from its subdivisions
  const getPhaseAmount = (phase) => {
    if (phase.isFixed) {
      // Finishing phase is 10% of all other phases
      const otherPhasesTotal = phases
        .filter(p => !p.isFixed)
        .reduce((sum, p) => sum + (p.subdivisions ? p.subdivisions.reduce((s, sub) => s + (parseFloat(sub.amount) || 0), 0) : 0), 0);
      return otherPhasesTotal * 0.1;
    }
    return phase.subdivisions ? phase.subdivisions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0) : 0;
  };

  // Calculate customer payable amount (10% discount from company)
  const getCustomerPayableAmount = (phaseAmount) => {
    return phaseAmount * 0.9;
  };

  const handlePhaseChange = (id, field, value) => {
    setPhases(phases.map(phase => 
      phase.id === id && !phase.isFixed ? { ...phase, [field]: value } : phase
    ));
  };

  // Handle subdivision changes
  const handleSubdivisionChange = (phaseId, subId, field, value) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          subdivisions: phase.subdivisions.map(sub =>
            sub.id === subId ? { ...sub, [field]: value } : sub
          )
        };
      }
      return phase;
    }));
  };

  // Add subdivision to a phase
  const addSubdivision = (phaseId) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        const newSubId = Math.max(...phase.subdivisions.map(s => s.id), 0) + 1;
        return {
          ...phase,
          subdivisions: [
            ...phase.subdivisions,
            { id: newSubId, category: '', description: '', amount: 0 }
          ]
        };
      }
      return phase;
    }));
  };

  // Remove subdivision from a phase
  const removeSubdivision = (phaseId, subId) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId && phase.subdivisions.length > 1) {
        return {
          ...phase,
          subdivisions: phase.subdivisions.filter(sub => sub.id !== subId)
        };
      }
      return phase;
    }));
  };

  const addPhase = () => {
    const nonFixedPhases = phases.filter(p => !p.isFixed);
    if (nonFixedPhases.length >= MAX_PHASES - 1) {
      alert(`Maximum ${MAX_PHASES - 1} custom phases allowed (plus finishing phase)`);
      return;
    }
    const newPhase = {
      id: nextPhaseId,
      name: `Phase ${nextPhaseId}`,
      percentage: 0,
      completionDate: '',
      subdivisions: [
        { id: 1, category: '', description: '', amount: 0 }
      ]
    };
    // Insert before the finishing phase
    const finishingPhase = phases.find(p => p.isFixed);
    const otherPhases = phases.filter(p => !p.isFixed);
    setPhases([...otherPhases, newPhase, finishingPhase]);
    setNextPhaseId(nextPhaseId + 1);
  };

  const removePhase = (id) => {
    const nonFixedPhases = phases.filter(p => !p.isFixed);
    if (nonFixedPhases.length > 1) {
      setPhases(phases.filter(phase => phase.id !== id));
    }
  };

  const getTotalPercentage = () => {
    return phases.reduce((sum, phase) => sum + (parseFloat(phase.percentage) || 0), 0);
  };

  const getTotalAmount = () => {
    // Only sum amounts from non-fixed phases (exclude finishing phase)
    return phases
      .filter(p => !p.isFixed)
      .reduce((sum, phase) => sum + getPhaseAmount(phase), 0);
  };

  const validatePhases = () => {
    const errors = {};
    const totalPercentage = getTotalPercentage();

    phases.forEach(phase => {
      if (!phase.name.trim()) {
        errors[`phase_${phase.id}_name`] = 'Phase name is required';
      }
      if (!phase.isFixed) {
        const phasePercentage = parseFloat(phase.percentage) || 0;
        if (phasePercentage < 10 || phasePercentage > MAX_PERCENTAGE_PER_PHASE) {
          errors[`phase_${phase.id}_percentage`] = `Percentage must be between 10 and ${MAX_PERCENTAGE_PER_PHASE}%`;
        }
      }
      if (!phase.completionDate) {
        errors[`phase_${phase.id}_date`] = 'Completion date is required';
      }
      
      // Validate subdivisions
      const phaseAmount = getPhaseAmount(phase);
      if (phaseAmount <= 0) {
        errors[`phase_${phase.id}_amount`] = 'Phase must have at least one subdivision with amount';
      }

      phase.subdivisions.forEach(sub => {
        if (!sub.category) {
          errors[`phase_${phase.id}_sub_${sub.id}_category`] = 'Work category is required';
        }
        if (parseFloat(sub.amount) <= 0) {
          errors[`phase_${phase.id}_sub_${sub.id}_amount`] = 'Amount must be greater than 0';
        }
      });
    });

    if (totalPercentage !== 100) {
      errors.totalPercentage = `Total percentage must equal 100% (currently ${totalPercentage}%)`;
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validatePhases();
    
    if (Object.keys(errors).length > 0) {
      setPhaseErrors(errors);
      return;
    }

    setPhaseErrors({});
    
    // Prepare data with phases and subdivisions
    const phasesWithAmounts = phases.map(phase => ({
      ...phase,
      amount: getPhaseAmount(phase)
    }));

    const proposalWithPhases = {
      ...proposalData,
      phases: phasesWithAmounts,
      totalAmount: getTotalAmount()
    };

    // Call the parent's submit with phases data
    onSubmitProposal(proposalWithPhases);
  };

  if (!isOpen || !project) return null;

  const totalPercentage = getTotalPercentage();
  const totalAmount = getTotalAmount();

  return (
    <div className="requests-proposal-modal requests-proposal-modal-active" onClick={onClose}>
      <div
        className="requests-proposal-modal-content requests-proposal-modal-phases"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="requests-proposal-modal-header">
          <h3>Create Proposal - Project Phases</h3>
          <button className="requests-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="requests-proposal-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Phases Section */}
            <div className="requests-phases-container">
              <div className="requests-phases-header-info">
                <h4 className="requests-phases-title">Construction Phases</h4>
                <span className="requests-phases-limit">
                  {phases.length}/{MAX_PHASES} phases (max {MAX_PERCENTAGE_PER_PHASE}% each)
                </span>
              </div>
              
              {phaseErrors.totalPercentage && (
                <div className="requests-error-message requests-error-message-block">
                  {phaseErrors.totalPercentage}
                </div>
              )}

              <div className="requests-phases-list">
                {phases.map((phase, index) => (
                  <div key={phase.id} className={`requests-phase-card ${phase.isFixed ? 'requests-phase-fixed' : ''}`}>
                    <div className="requests-phase-header">
                      <h5>{phase.isFixed ? 'Final Phase: ' : 'Phase ' + (index + 1) + ': '}{phase.name}</h5>
                      {!phase.isFixed && phases.filter(p => !p.isFixed).length > 1 && (
                        <button
                          type="button"
                          className="requests-phase-remove-btn"
                          onClick={() => removePhase(phase.id)}
                          title="Remove this phase"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>

                    <div className="requests-phase-form">
                      <div className="requests-phase-form-row">
                        <div className="requests-phase-form-group">
                          <label>Phase Name</label>
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) => handlePhaseChange(phase.id, 'name', e.target.value)}
                            className={`requests-proposal-form-control ${
                              phaseErrors[`phase_${phase.id}_name`] ? 'requests-input-error' : ''
                            }`}
                            placeholder="e.g., Foundation Work"
                            disabled={phase.isFixed}
                          />
                          {phaseErrors[`phase_${phase.id}_name`] && (
                            <div className="requests-error-message">
                              {phaseErrors[`phase_${phase.id}_name`]}
                            </div>
                          )}
                        </div>

                        <div className="requests-phase-form-group">
                          <label>{phase.isFixed ? 'Work Percentage (Auto-calculated)' : `Work Percentage (min 10%, max ${MAX_PERCENTAGE_PER_PHASE}%)`}</label>
                          <input
                            type="number"
                            min="10"
                            max={MAX_PERCENTAGE_PER_PHASE}
                            step="1"
                            value={phase.percentage}
                            onChange={(e) => handlePhaseChange(phase.id, 'percentage', e.target.value)}
                            className={`requests-proposal-form-control ${
                              phaseErrors[`phase_${phase.id}_percentage`] ? 'requests-input-error' : ''
                            } ${phase.isFixed ? 'requests-input-readonly' : ''}`}
                            placeholder="0"
                            readOnly={phase.isFixed}
                            disabled={phase.isFixed}
                          />
                          {phaseErrors[`phase_${phase.id}_percentage`] && (
                            <div className="requests-error-message">
                              {phaseErrors[`phase_${phase.id}_percentage`]}
                            </div>
                          )}
                        </div>

                        <div className="requests-phase-form-group">
                          <label>Completion Date</label>
                          <input
                            type="date"
                            value={phase.completionDate}
                            onChange={(e) => handlePhaseChange(phase.id, 'completionDate', e.target.value)}
                            className={`requests-proposal-form-control ${
                              phaseErrors[`phase_${phase.id}_date`] ? 'requests-input-error' : ''
                            }`}
                          />
                          {phaseErrors[`phase_${phase.id}_date`] && (
                            <div className="requests-error-message">
                              {phaseErrors[`phase_${phase.id}_date`]}
                            </div>
                          )}
                        </div>

                        <div className="requests-phase-total-display">
                          <strong>{phase.isFixed ? 'Phase Total Amount (10% of all phases):' : 'Phase Total Amount:'}</strong>
                          <span className="requests-phase-amount-value">₹{getPhaseAmount(phase).toLocaleString('en-IN')}</span>
                        </div>

                        {!phase.isFixed && (
                          <div className="requests-phase-customer-payable">
                            <strong>Customer Payable (10% discount):</strong>
                            <span className="requests-customer-amount-value">₹{getCustomerPayableAmount(getPhaseAmount(phase)).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      {/* Subdivisions Section - Only for non-fixed phases */}
                      {!phase.isFixed && (
                        <div className="requests-subdivisions-container">
                          <div className="requests-subdivisions-header">
                            <span className="requests-subdivisions-title">Work Items Breakdown</span>
                          </div>

                          <div className="requests-subdivisions-list">
                            {phase.subdivisions.map((sub, subIndex) => (
                              <div key={sub.id} className="requests-subdivision-row">
                                <div className="requests-subdivision-fields">
                                  <div className="requests-subdivision-field requests-subdivision-category">
                                    <input
                                      type="text"
                                      value={sub.category}
                                      onChange={(e) => handleSubdivisionChange(phase.id, sub.id, 'category', e.target.value)}
                                    className={`requests-proposal-form-control ${
                                      phaseErrors[`phase_${phase.id}_sub_${sub.id}_category`] ? 'requests-input-error' : ''
                                    }`}
                                    placeholder="e.g., Flooring, Electrical, Painting"
                                  />
                                </div>

                                <div className="requests-subdivision-field requests-subdivision-desc">
                                  <input
                                    type="text"
                                    value={sub.description}
                                    onChange={(e) => handleSubdivisionChange(phase.id, sub.id, 'description', e.target.value)}
                                    className="requests-proposal-form-control"
                                    placeholder="Details (optional)"
                                  />
                                </div>

                                <div className="requests-subdivision-field requests-subdivision-amount">
                                  <input
                                    type="number"
                                    min="0"
                                    step="500"
                                    value={sub.amount}
                                    onChange={(e) => handleSubdivisionChange(phase.id, sub.id, 'amount', e.target.value)}
                                    className={`requests-proposal-form-control ${
                                      phaseErrors[`phase_${phase.id}_sub_${sub.id}_amount`] ? 'requests-input-error' : ''
                                    }`}
                                    placeholder="Amount (₹)"
                                  />
                                </div>

                                <div className="requests-subdivision-actions">
                                  {phase.subdivisions.length > 1 && (
                                    <button
                                      type="button"
                                      className="requests-subdivision-remove-btn"
                                      onClick={() => removeSubdivision(phase.id, sub.id)}
                                      title="Remove"
                                    >
                                      <i className="fas fa-minus-circle"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="requests-btn-add-subdivision"
                          onClick={() => addSubdivision(phase.id)}
                        >
                          <i className="fas fa-plus"></i> Add Work Item
                        </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Section */}
              <div className="requests-phases-summary">
                <div className="requests-summary-item">
                  <span>Total Percentage:</span>
                  <span className={totalPercentage === 100 ? 'requests-summary-valid' : 'requests-summary-invalid'}>
                    {totalPercentage}%
                  </span>
                </div>
                <div className="requests-summary-item">
                  <span>Total Project Amount:</span>
                  <span className="requests-summary-amount">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Add Phase Button */}
              {phases.filter(p => !p.isFixed).length < MAX_PHASES - 1 && (
                <button
                  type="button"
                  className="requests-btn-add-phase"
                  onClick={addPhase}
                >
                  <i className="fas fa-plus"></i> Add Phase ({phases.filter(p => !p.isFixed).length}/{MAX_PHASES - 1} + Finishing)
                </button>
              )}
              {phases.filter(p => !p.isFixed).length >= MAX_PHASES - 1 && (
                <div className="requests-max-phases-info">
                  Maximum {MAX_PHASES - 1} custom phases reached (plus finishing phase)
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="requests-proposal-btn-primary requests-btn-submit-phases">
              Send Proposal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
