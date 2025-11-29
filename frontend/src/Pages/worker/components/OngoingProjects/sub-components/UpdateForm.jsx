import React from 'react';
import './UpdateForm.css';

const UpdateForm = ({ 
  projectId, 
  projectType, 
  updateText, 
  onTextChange, 
  onImageChange, 
  onSubmit 
}) => {
  return (
    <form 
      className="wkop-update-form" 
      onSubmit={(e) => onSubmit(e, projectId, projectType)}
    >
      <div className="wkop-form-group">
        <label>Update Description</label>
        <textarea
          value={updateText || ''}
          onChange={(e) => onTextChange(projectId, 'updateText', e.target.value)}
          placeholder="Enter your project update..."
          required
        />
      </div>
      
      <div className="wkop-form-group">
        <label>Upload Image (Optional)</label>
        <input
          type="file"
          name={`updateImage-${projectId}`}
          onChange={(e) => onImageChange(projectId, 'updateImage', e.target.files[0])}
          accept="image/*"
        />
      </div>
      
      <button type="submit" className="wkop-btn wkop-btn-primary">
        Submit Update
      </button>
    </form>
  );
};

export default UpdateForm;
