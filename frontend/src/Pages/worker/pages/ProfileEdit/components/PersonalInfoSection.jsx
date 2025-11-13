import '../ProfileEdit.css';

const PersonalInfoSection = ({ formData, onInputChange, onProfileImageChange }) => {
  return (
    <div className="form-section">
      <h2>Personal Information</h2>

      {/* Profile Image */}
      <div className="profile-image-container">
        <div className="profile-preview" id="profilePreview">
          {formData.profileImagePreview ? (
            <img
              src={formData.profileImagePreview}
              alt="Profile Preview"
              className="profile-image"
            />
          ) : (
            <span className="profile-placeholder">Profile Photo</span>
          )}
        </div>
        <input
          type="file"
          id="profileImage"
          name="profileImage"
          accept="image/*"
          onChange={onProfileImageChange}
          className="file-input"
        />
        <label htmlFor="profileImage" className="file-input-label">
          Choose Profile Image
        </label>
      </div>

      {/* Name Field */}
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          disabled
          className="form-input"
        />
      </div>

      {/* Professional Title Field */}
      <div className="form-group">
        <label htmlFor="title">Professional Title</label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="e.g., Architect, Interior Designer"
          value={formData.title}
          onChange={onInputChange}
          required
          className="form-input"
        />
      </div>

      {/* Years of Experience Field */}
      <div className="form-group">
        <label htmlFor="experience">Years of Experience</label>
        <input
          type="number"
          id="experience"
          name="experience"
          min="0"
          placeholder="0"
          value={formData.experience}
          onChange={onInputChange}
          required
          className="form-input"
        />
      </div>
    </div>
  );
};

export default PersonalInfoSection;
