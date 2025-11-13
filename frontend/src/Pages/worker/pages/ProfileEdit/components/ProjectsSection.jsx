import { useState } from 'react';
import ProjectItem from './ProjectItem';

const ProjectsSection = ({ projects, onProjectsChange }) => {
  const [nextId, setNextId] = useState(projects.length + 1);

  const addProject = () => {
    const newProject = {
      id: nextId,
      name: '',
      year: new Date().getFullYear(),
      location: '',
      description: '',
      imageFile: null,
      imagePreview: null,
    };
    onProjectsChange([...projects, newProject]);
    setNextId(nextId + 1);
  };

  const updateProject = (id, updatedProject) => {
    const updated = projects.map(project =>
      project.id === id || (project.name && projects.indexOf(project) === id) ? updatedProject : project
    );
    onProjectsChange(updated);
  };

  const removeProject = (id) => {
    const updated = projects.filter((_, index) => {
      if (projects[index].id !== undefined) {
        return projects[index].id !== id;
      }
      return index !== id;
    });
    onProjectsChange(updated);
  };

  const handleProjectImageChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updated = [...projects];
        updated[index] = {
          ...updated[index],
          imageFile: file,
          imagePreview: event.target.result,
        };
        onProjectsChange(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="form-section">
      <h2>Notable Projects</h2>
      <p className="section-description">Showcase your best work</p>

      <button
        type="button"
        onClick={addProject}
        className="add-project-btn"
      >
        + Add Project
      </button>

      <div className="projects-container">
        {projects.length === 0 ? (
          <p className="empty-message">No projects added yet. Click "Add Project" to get started.</p>
        ) : (
          projects.map((project, index) => (
            <ProjectItem
              key={index}
              project={project}
              index={index}
              onUpdate={(updatedProject) => updateProject(index, updatedProject)}
              onRemove={() => removeProject(index)}
              onImageChange={(file) => handleProjectImageChange(index, file)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;
