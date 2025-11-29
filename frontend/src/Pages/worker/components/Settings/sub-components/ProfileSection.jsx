import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileSection.css';

const ProfileSection = ({ user }) => {
  return (
    <div className="wkst-settings-section">
      <div className="wkst-profile-header">
        <img
          src={user.profileImage || 'https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg'}
          alt={user.name}
          className="wkst-profile-image-large"
        />
        <div className="wkst-profile-title-info">
          <h2>{user.name}</h2>
          <p>
            <strong>{user.professionalTitle || 'Professional'}</strong> with{' '}
            {user.experience || 0} years experience
          </p>
        </div>
      </div>

      <div className="wkst-profile-section-divider">
        <h3>About</h3>
        <p>{user.about || 'No information provided.'}</p>
        <p>
          <strong>Specialties:</strong>{' '}
          {user.specialties && user.specialties.length > 0
            ? user.specialties.join(', ')
            : 'None specified'}
        </p>
      </div>

      <div className="wkst-profile-section-divider">
        <h3>Notable Projects</h3>
        {user.projects && user.projects.length > 0 ? (
          user.projects.map((project, index) => (
            <div key={index} className="wkst-project">
              <h4>
                {project.name} ({project.year})
              </h4>
              <p>
                <strong>Location:</strong> {project.location}
              </p>
              <p>{project.description}</p>
              {project.image && (
                <img
                  src={project.image}
                  alt={project.name}
                  className="wkst-project-image"
                />
              )}
            </div>
          ))
        ) : (
          <p>No projects have been added yet.</p>
        )}
      </div>

      <div className="wkst-button-container">
        <Link to="/workerdashboard/profile-edit" className="wkst-btn wkst-btn-primary">
          <i className="fas fa-edit"></i> Edit Profile
        </Link>
      </div>
    </div>
  );
};

export default ProfileSection;
