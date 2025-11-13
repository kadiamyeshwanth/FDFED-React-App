const SPECIALTY_OPTIONS = [
  'Sustainable design',
  'Urban planning',
  'Residential architecture',
  'Commercial architecture',
  'Interior design',
  'Landscape architecture',
  'BIM (Building Information Modeling)',
  'CAD Design',
  'Renovation & Restoration',
  'Public Infrastructure',
];

const SpecialtiesSection = ({ specialties, onSpecialtiesChange }) => {
  const handleSpecialtyToggle = (specialty) => {
    const updated = specialties.includes(specialty)
      ? specialties.filter(s => s !== specialty)
      : [...specialties, specialty];
    onSpecialtiesChange(updated);
  };

  return (
    <div className="form-section">
      <h2>Specialties</h2>
      <p className="section-description">Select all that apply</p>

      <div className="specialties-grid">
        {SPECIALTY_OPTIONS.map((specialty) => (
          <div key={specialty} className="specialty-item">
            <input
              type="checkbox"
              id={specialty}
              name="specialties"
              value={specialty}
              checked={specialties.includes(specialty)}
              onChange={() => handleSpecialtyToggle(specialty)}
              className="specialty-checkbox"
            />
            <label htmlFor={specialty} className="specialty-label">
              {specialty}
            </label>
          </div>
        ))}
      </div>

      {specialties.length === 0 && (
        <p className="empty-message">No specialties selected</p>
      )}

      {specialties.length > 0 && (
        <div className="selected-specialties">
          <strong>Selected:</strong>
          <div className="specialty-tags">
            {specialties.map((specialty) => (
              <span key={specialty} className="specialty-tag">
                {specialty}
                <button
                  type="button"
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialtiesSection;
