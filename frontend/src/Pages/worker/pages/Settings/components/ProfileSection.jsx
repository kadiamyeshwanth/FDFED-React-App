import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSection = ({ worker }) => {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate(`/worker/profile-edit?id=${worker._id}`);
  };

  return (
    <div className="profile-content">
      <div className="profile-header">
        <img
          src={worker.profileImage || 'https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg'}
          alt={worker.name}
          className="profile-image-large"
        />
        <div className="profile-title-info">
          <h2>{worker.name}</h2>
          <p>
            <strong>{worker.professionalTitle || 'Professional'}</strong> with {worker.experience || 0} years
            experience
          </p>
        </div>
      </div>

      <div className="profile-section-divider">
        <h3>About</h3>
        <p>{worker.about || 'No bio added yet'}</p>
        <p>
          <strong>Specialties:</strong> {worker.specialties && worker.specialties.length > 0 ? worker.specialties.join(', ') : 'None'}
        </p>
      </div>

      <div className="profile-section-divider">
        <h3>Notable Projects</h3>
        {worker.projects && worker.projects.length > 0 ? (
          <div className="projects-list">
            {worker.projects.map((project, index) => (
              <div key={index} className="project">
                <h4>
                  {project.name} ({project.year})
                </h4>
                <p>
                  <strong>Location:</strong> {project.location}
                </p>
                <p>{project.description}</p>
                {project.image && <img src={project.image} alt={project.name} className="project-image" />}
              </div>
            ))}
          </div>
        ) : (
          <p>No projects have been added yet.</p>
        )}
      </div>

      <div className="action-buttons">
        <button onClick={handleEditProfile} className="btn">
          Edit Full Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
