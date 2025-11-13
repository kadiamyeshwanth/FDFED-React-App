import React, { useState } from 'react'

const ApplicationModal = ({ company, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    location: '',
    linkedin: '',
    experience: '',
    expectedSalary: '',
    positionApplying: '',
    primarySkills: '',
    workExperience: '',
    termsAgree: false,
    resume: null
  })

  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({
      ...prev,
      resume: file
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.termsAgree) {
      alert('Please agree to the terms and conditions')
      return
    }

    if (!formData.resume) {
      alert('Please upload your resume')
      return
    }

    try {
      setLoading(true)
      
      // Create FormData for multipart submission
      const submitFormData = new FormData()
      submitFormData.append('fullName', formData.fullName)
      submitFormData.append('email', formData.email)
      submitFormData.append('location', formData.location)
      submitFormData.append('linkedin', formData.linkedin)
      submitFormData.append('experience', formData.experience)
      submitFormData.append('expectedSalary', formData.expectedSalary)
      submitFormData.append('positionApplying', formData.positionApplying)
      submitFormData.append('primarySkills', formData.primarySkills)
      submitFormData.append('workExperience', formData.workExperience)
      submitFormData.append('termsAgree', formData.termsAgree)
      submitFormData.append('companyId', company._id)
      submitFormData.append('resume', formData.resume)

      await onSubmit(submitFormData)
    } catch (error) {
      console.error('Error in ApplicationModal:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal active">
      <div className="modal-content application-modal">
        <button className="close-modal" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Apply to {company.companyName}</h2>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Current Location/City *</label>
                  <input
                    type="text"
                    className="form-input"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="linkedin" className="form-label">LinkedIn Profile</label>
                  <input
                    type="url"
                    className="form-input"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Professional Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="experience" className="form-label">Years of Experience *</label>
                  <input
                    type="number"
                    className="form-input"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expectedSalary" className="form-label">Expected Salary (₹ per month) *</label>
                  <input
                    type="number"
                    className="form-input"
                    id="expectedSalary"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="positionApplying" className="form-label">Position Applying For *</label>
                  <input
                    type="text"
                    className="form-input"
                    id="positionApplying"
                    name="positionApplying"
                    value={formData.positionApplying}
                    onChange={handleInputChange}
                    placeholder="e.g., Project Manager, Site Engineer"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="primarySkills" className="form-label">Primary Skills (comma-separated) *</label>
                  <input
                    type="text"
                    className="form-input"
                    id="primarySkills"
                    name="primarySkills"
                    value={formData.primarySkills}
                    onChange={handleInputChange}
                    placeholder="e.g., Project Management, CAD, AutoCAD"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Work Experience</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="workExperience" className="form-label">Describe Your Work Experience *</label>
                  <textarea
                    className="form-textarea"
                    id="workExperience"
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                    placeholder="Tell us about your professional background, achievements, and relevant projects..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Resume & Agreement</h3>
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="resume" className="form-label">Upload Resume (PDF or DOC) *</label>
                  <input
                    type="file"
                    className="form-input"
                    id="resume"
                    name="resume"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width checkbox-group">
                  <input
                    type="checkbox"
                    id="termsAgree"
                    name="termsAgree"
                    checked={formData.termsAgree}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="termsAgree">
                    I agree to the terms and conditions and authorize {company.companyName} to contact me
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApplicationModal
