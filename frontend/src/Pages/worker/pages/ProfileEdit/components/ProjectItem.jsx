const ProjectItem = ({ project, index, onUpdate, onRemove, onImageChange }) => {
  const handleChange = (field, value) => {
    onUpdate({
      ...project,
      [field]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div className="project-item">
      <div className="project-header">
        <h3>Project #{index + 1}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="remove-project-btn"
          title="Remove project"
        >
          Remove
        </button>
      </div>

      <div className="form-group">
        <label htmlFor={`projectName-${index}`}>Project Name</label>
        <input
          type="text"
          id={`projectName-${index}`}
          placeholder="e.g., Modern Office Complex"
          value={project.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          className="form-input"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`projectYear-${index}`}>Year</label>
          <input
            type="number"
            id={`projectYear-${index}`}
            min="1900"
            max={new Date().getFullYear()}
            value={project.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value) || new Date().getFullYear())}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor={`projectLocation-${index}`}>Location</label>
          <input
            type="text"
            id={`projectLocation-${index}`}
            placeholder="e.g., New York, USA"
            value={project.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`projectDescription-${index}`}>Description</label>
        <textarea
          id={`projectDescription-${index}`}
          placeholder="Describe the project, your role, and key achievements..."
          value={project.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
          className="form-textarea"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor={`projectImage-${index}`}>Project Image</label>
        <div className="image-upload-container">
          <input
            type="file"
            id={`projectImage-${index}`}
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          <label htmlFor={`projectImage-${index}`} className="file-input-label">
            Choose Image
          </label>
        </div>

        {(project.imagePreview || project.image) && (
          <div className="project-image-preview">
            <img
              src={project.imagePreview || project.image}
              alt={`Project ${index + 1}`}
              className="preview-image"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectItem;
