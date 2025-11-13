const AboutSection = ({ about, onAboutChange }) => {
  return (
    <div className="form-section">
      <h2>About</h2>

      <div className="form-group">
        <label htmlFor="about">Professional Biography</label>
        <textarea
          id="about"
          name="about"
          placeholder="Write a brief summary of your professional background, skills, and achievements..."
          value={about}
          onChange={(e) => onAboutChange(e.target.value)}
          required
          className="form-textarea"
          rows="5"
        />
        <div className="char-count">
          {about.length} characters
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
