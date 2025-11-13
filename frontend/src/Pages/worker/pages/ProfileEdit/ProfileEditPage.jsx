import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalInfoSection from './components/PersonalInfoSection';
import AboutSection from './components/AboutSection';
import SpecialtiesSection from './components/SpecialtiesSection';
import ProjectsSection from './components/ProjectsSection';
import '../ProfileEdit.css';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    experience: '',
    about: '',
    specialties: [],
    profileImage: null,
    profileImagePreview: null,
  });

  const [projects, setProjects] = useState([]);

  // Fetch worker data on mount
  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/worker/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch worker data');
        }

        const data = await response.json();
        const worker = data.data || data;

        setFormData({
          name: worker.name || '',
          title: worker.professionalTitle || '',
          experience: worker.experience || '',
          about: worker.about || '',
          specialties: worker.specialties || [],
          profileImage: null,
          profileImagePreview: worker.profileImage || null,
        });

        setProjects(worker.projects || []);
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
        console.error('Error fetching worker data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, [navigate]);

  // Update form field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value
    }));
  };

  // Handle profile image
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          profileImage: file,
          profileImagePreview: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update specialties
  const handleSpecialtiesChange = (selectedSpecialties) => {
    setFormData(prev => ({
      ...prev,
      specialties: selectedSpecialties
    }));
  };

  // Update about section
  const handleAboutChange = (about) => {
    setFormData(prev => ({
      ...prev,
      about
    }));
  };

  // Update projects
  const handleProjectsChange = (updatedProjects) => {
    setProjects(updatedProjects);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // Create FormData for multipart submission
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('title', formData.title);
      submitFormData.append('experience', formData.experience);
      submitFormData.append('about', formData.about);

      // Add specialties
      formData.specialties.forEach(specialty => {
        submitFormData.append('specialties', specialty);
      });

      // Add profile image if changed
      if (formData.profileImage) {
        submitFormData.append('profileImage', formData.profileImage);
      }

      // Add projects
      projects.forEach((project, index) => {
        submitFormData.append(`projectName-${index + 1}`, project.name);
        submitFormData.append(`projectYear-${index + 1}`, project.year);
        submitFormData.append(`projectLocation-${index + 1}`, project.location);
        submitFormData.append(`projectDescription-${index + 1}`, project.description);
        
        // Only add new project images
        if (project.imageFile) {
          submitFormData.append(`projectImage-${index + 1}`, project.imageFile);
        }
      });

      const response = await fetch('/worker/profile/update', {
        method: 'POST',
        body: submitFormData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      setSuccess(result.message || 'Profile updated successfully!');
      
      // Redirect after brief delay
      setTimeout(() => {
        navigate(result.redirect || '/worker');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-edit-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-form-wrapper">
        <h1>Edit Your Profile</h1>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-btn">&times;</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="close-btn">&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Personal Information Section */}
          <PersonalInfoSection
            formData={formData}
            onInputChange={handleInputChange}
            onProfileImageChange={handleProfileImageChange}
          />

          {/* About Section */}
          <AboutSection
            about={formData.about}
            onAboutChange={handleAboutChange}
          />

          {/* Specialties Section */}
          <SpecialtiesSection
            specialties={formData.specialties}
            onSpecialtiesChange={handleSpecialtiesChange}
          />

          {/* Projects Section */}
          <ProjectsSection
            projects={projects}
            onProjectsChange={handleProjectsChange}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;
