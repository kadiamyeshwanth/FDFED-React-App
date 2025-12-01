// src/Pages/customer/components/Forms/ConstructionForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ConstructionForm.css";

const ConstructionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract companyId from URL
  const [companyId, setCompanyId] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCompanyId(params.get("companyId") || "");
  }, [location.search]);

  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    buildingType: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    totalArea: "",
    estimatedBudget: "",
    projectTimeline: "",
    projectLocation: "",
    projectAddress: "",
    totalFloors: "",
    accessibilityNeeds: "",
    energyEfficiency: "",
    specialRequirements: "",
  });

  const [floors, setFloors] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generate floor details
  const generateFloors = () => {
    const total = parseInt(formData.totalFloors);
    const newErrors = { ...errors };
    delete newErrors.totalFloors;

    if (isNaN(total) || total <= 0) {
      newErrors.totalFloors =
        "Please enter a valid number of floors (positive number)";
      setErrors(newErrors);
      return;
    }

    const newFloors = Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      floorType: "",
      floorArea: "",
      floorDescription: "",
      floorImage: null,
      preview: null,
    }));
    setFloors(newFloors);
    setErrors(newErrors);
  };

  // Update floor field
  const updateFloor = (id, field, value) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Remove floor
  const removeFloor = (id) => {
    setFloors((prev) => prev.filter((f) => f.id !== id));
  };

  // Handle floor image
  const handleFloorImage = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFloors((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, floorImage: file, preview: reader.result } : f
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Static fields
    if (!formData.projectName.trim())
      newErrors.projectName = "Please enter a project name";
    if (!formData.buildingType)
      newErrors.buildingType = "Please select a building type";
    if (!formData.customerName.trim())
      newErrors.customerName = "Please enter your full name";

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (
      !formData.customerEmail.trim() ||
      !emailRegex.test(formData.customerEmail)
    ) {
      newErrors.customerEmail =
        "Please enter a valid email address (e.g., example@domain.com)";
    }

    const phoneDigits = formData.customerPhone
      .replace(/\D/g, "")
      .replace(/^0+/, "");
    if (!/^\d{10}$/.test(phoneDigits)) {
      newErrors.customerPhone =
        "Please enter a valid 10-digit phone number (e.g., 1234567890)";
    }

    if (!formData.totalArea || parseFloat(formData.totalArea) <= 0) {
      newErrors.totalArea = "Please enter a valid area (positive number)";
    }
    if (
      !formData.estimatedBudget ||
      parseFloat(formData.estimatedBudget) <= 0
    ) {
      newErrors.estimatedBudget =
        "Please enter a valid budget (positive number)";
    }
    if (
      !formData.projectTimeline ||
      parseFloat(formData.projectTimeline) <= 0
    ) {
      newErrors.projectTimeline =
        "Please enter a valid timeline (positive number)";
    }
    if (!/^\d{6}$/.test(formData.projectLocation)) {
      newErrors.projectLocation = "Please enter a valid pincode (e.g., 534260)";
    }
    if (!formData.projectAddress.trim())
      newErrors.projectAddress = "Please enter a project address";
    if (!formData.totalFloors || parseInt(formData.totalFloors) <= 0) {
      newErrors.totalFloors =
        "Please enter a valid number of floors (positive number)";
    }
    if (!formData.accessibilityNeeds)
      newErrors.accessibilityNeeds = "Please select an accessibility option";
    if (!formData.energyEfficiency)
      newErrors.energyEfficiency = "Please select an energy efficiency goal";
    if (!formData.specialRequirements.trim())
      newErrors.specialRequirements = "Please enter any special requirements";

    // Dynamic floor validation
    floors.forEach((floor) => {
      if (!floor.floorType)
        newErrors[`floorType-${floor.id}`] = "Please select a floor type";
      if (!floor.floorArea || parseFloat(floor.floorArea) <= 0) {
        newErrors[`floorArea-${floor.id}`] =
          "Please enter a valid floor area (positive number)";
      }
      if (!floor.floorDescription.trim()) {
        newErrors[`floorDescription-${floor.id}`] =
          "Please enter a floor description";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const submitData = new FormData();
    submitData.append("companyId", companyId);

    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    floors.forEach((floor, idx) => {
      submitData.append(`floorType-${idx + 1}`, floor.floorType);
      submitData.append(`floorArea-${idx + 1}`, floor.floorArea);
      submitData.append(`floorDescription-${idx + 1}`, floor.floorDescription);
      if (floor.floorImage) {
        submitData.append(`floorImage-${idx + 1}`, floor.floorImage);
      }
    });

    const siteFilesInput = document.getElementById("siteFiles");
    if (siteFilesInput?.files) {
      Array.from(siteFilesInput.files).forEach((file) => {
        submitData.append("siteFiles", file);
      });
    }

    try {
      const res = await axios.post("/api/construction_form", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        navigate("/customerdashboard/job_status");
      } else {
        alert(res.data.message || "Failed to submit project");
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="constructionform-container">
      <div className="constructionform-page-title">
        <h1>Construction Project Submission</h1>
        <div className="constructionform-underline"></div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <input type="hidden" name="companyId" value={companyId} />

        {/* Project Information */}
        <div className="constructionform-form-section">
          <h2>Project Information</h2>
          <div className="constructionform-form-grid">
            <div className="constructionform-form-group">
              <label
                htmlFor="projectName"
                className="constructionform-required"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
              />
              {errors.projectName && (
                <div className="constructionform-error-text">
                  {errors.projectName}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="buildingType"
                className="constructionform-required"
              >
                Building Type
              </label>
              <select
                id="buildingType"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleInputChange}
              >
                <option value="">Select Building Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixedUse">Mixed Use</option>
                <option value="other">Other</option>
              </select>
              {errors.buildingType && (
                <div className="constructionform-error-text">
                  {errors.buildingType}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="constructionform-form-section">
          <h2>Customer Information</h2>
          <div className="constructionform-form-grid">
            <div className="constructionform-form-group">
              <label
                htmlFor="customerName"
                className="constructionform-required"
              >
                Full Name
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
              />
              {errors.customerName && (
                <div className="constructionform-error-text">
                  {errors.customerName}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="customerEmail"
                className="constructionform-required"
              >
                Email Address
              </label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
              />
              {errors.customerEmail && (
                <div className="constructionform-error-text">
                  {errors.customerEmail}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="customerPhone"
                className="constructionform-required"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
              />
              {errors.customerPhone && (
                <div className="constructionform-error-text">
                  {errors.customerPhone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="constructionform-form-section">
          <h2>Project Details</h2>
          <div className="constructionform-form-grid">
            <div className="constructionform-form-group">
              <label htmlFor="totalArea" className="constructionform-required">
                Total Building Area (sq meters)
              </label>
              <input
                type="number"
                id="totalArea"
                name="totalArea"
                step="1"
                value={formData.totalArea}
                onChange={handleInputChange}
              />
              {errors.totalArea && (
                <div className="constructionform-error-text">
                  {errors.totalArea}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="estimatedBudget"
                className="constructionform-required"
              >
                Estimated Budget (₹)
              </label>
              <input
                type="number"
                id="estimatedBudget"
                name="estimatedBudget"
                value={formData.estimatedBudget}
                onChange={handleInputChange}
              />
              {errors.estimatedBudget && (
                <div className="constructionform-error-text">
                  {errors.estimatedBudget}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="projectTimeline"
                className="constructionform-required"
              >
                Expected Timeline (months)
              </label>
              <input
                type="number"
                id="projectTimeline"
                name="projectTimeline"
                value={formData.projectTimeline}
                onChange={handleInputChange}
              />
              {errors.projectTimeline && (
                <div className="constructionform-error-text">
                  {errors.projectTimeline}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="projectLocation"
                className="constructionform-required"
              >
                Project Location Pincode
              </label>
              <input
                type="text"
                id="projectLocation"
                name="projectLocation"
                placeholder="e.g., 534260"
                value={formData.projectLocation}
                onChange={handleInputChange}
              />
              {errors.projectLocation && (
                <div className="constructionform-error-text">
                  {errors.projectLocation}
                </div>
              )}
            </div>
          </div>
          <div className="constructionform-form-group">
            <label
              htmlFor="projectAddress"
              className="constructionform-required"
            >
              Project Address
            </label>
            <textarea
              id="projectAddress"
              name="projectAddress"
              value={formData.projectAddress}
              onChange={handleInputChange}
            />
            {errors.projectAddress && (
              <div className="constructionform-error-text">
                {errors.projectAddress}
              </div>
            )}
          </div>
        </div>

        {/* Floor Plans */}
        <div className="constructionform-form-section">
          <h2>Floor Plans</h2>
          <div className="constructionform-form-group">
            <label htmlFor="totalFloors" className="constructionform-required">
              Number of Floors
            </label>
            <input
              type="number"
              id="totalFloors"
              name="totalFloors"
              min="1"
              value={formData.totalFloors}
              onChange={handleInputChange}
            />
            {errors.totalFloors && (
              <div className="constructionform-error-text">
                {errors.totalFloors}
              </div>
            )}
          </div>

          <div id="constructionform-floorDetails">
            {floors.map((floor) => (
              <div
                key={floor.id}
                className="constructionform-floor-container"
                id={`floor-${floor.id}`}
              >
                <div className="constructionform-floor-header">
                  <h3>Floor {floor.id}</h3>
                  <button
                    type="button"
                    className="constructionform-btn constructionform-btn-remove"
                    onClick={() => removeFloor(floor.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="constructionform-form-grid">
                  <div className="constructionform-form-group">
                    <label
                      htmlFor={`floorType-${floor.id}`}
                      className="constructionform-required"
                    >
                      Floor Type
                    </label>
                    <select
                      id={`floorType-${floor.id}`}
                      value={floor.floorType}
                      onChange={(e) =>
                        updateFloor(floor.id, "floorType", e.target.value)
                      }
                    >
                      <option value="">Select Floor Type</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="parking">Parking</option>
                      <option value="mechanical">Mechanical/Utility</option>
                      <option value="other">Other</option>
                    </select>
                    {errors[`floorType-${floor.id}`] && (
                      <div className="constructionform-error-text">
                        {errors[`floorType-${floor.id}`]}
                      </div>
                    )}
                  </div>
                  <div className="constructionform-form-group">
                    <label
                      htmlFor={`floorArea-${floor.id}`}
                      className="constructionform-required"
                    >
                      Floor Area (sq meters)
                    </label>
                    <input
                      type="number"
                      id={`floorArea-${floor.id}`}
                      step="1"
                      value={floor.floorArea}
                      onChange={(e) =>
                        updateFloor(floor.id, "floorArea", e.target.value)
                      }
                    />
                    {errors[`floorArea-${floor.id}`] && (
                      <div className="constructionform-error-text">
                        {errors[`floorArea-${floor.id}`]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="constructionform-form-group">
                  <label
                    htmlFor={`floorDescription-${floor.id}`}
                    className="constructionform-required"
                  >
                    Floor Description
                  </label>
                  <textarea
                    id={`floorDescription-${floor.id}`}
                    placeholder="Describe the layout and purpose of this floor"
                    value={floor.floorDescription}
                    onChange={(e) =>
                      updateFloor(floor.id, "floorDescription", e.target.value)
                    }
                  />
                  {errors[`floorDescription-${floor.id}`] && (
                    <div className="constructionform-error-text">
                      {errors[`floorDescription-${floor.id}`]}
                    </div>
                  )}
                </div>
                <div className="constructionform-form-group">
                  <label htmlFor={`floorImage-${floor.id}`}>
                    Floor Plan Image (Optional)
                  </label>
                  <input
                    type="file"
                    id={`floorImage-${floor.id}`}
                    accept="image/*"
                    onChange={(e) =>
                      handleFloorImage(floor.id, e.target.files[0])
                    }
                  />
                  {floor.preview && (
                    <img
                      src={floor.preview}
                      alt="Floor Plan Preview"
                      className="constructionform-image-preview"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="constructionform-btn"
            onClick={generateFloors}
            disabled={!formData.totalFloors}
          >
            Generate Floor Details
          </button>
        </div>

        {/* Additional Requirements */}
        <div className="constructionform-form-section">
          <h2>Additional Requirements</h2>
          <div className="constructionform-form-grid">
            <div className="constructionform-form-group">
              <label
                htmlFor="accessibilityNeeds"
                className="constructionform-required"
              >
                Accessibility Needs
              </label>
              <select
                id="accessibilityNeeds"
                name="accessibilityNeeds"
                value={formData.accessibilityNeeds}
                onChange={handleInputChange}
              >
                <option value="">Select Options</option>
                <option value="wheelchair">Wheelchair Accessibility</option>
                <option value="elevators">Elevators</option>
                <option value="ramps">Ramps</option>
                <option value="other">Other</option>
                <option value="none">None</option>
              </select>
              {errors.accessibilityNeeds && (
                <div className="constructionform-error-text">
                  {errors.accessibilityNeeds}
                </div>
              )}
            </div>
            <div className="constructionform-form-group">
              <label
                htmlFor="energyEfficiency"
                className="constructionform-required"
              >
                Energy Efficiency Goals
              </label>
              <select
                id="energyEfficiency"
                name="energyEfficiency"
                value={formData.energyEfficiency}
                onChange={handleInputChange}
              >
                <option value="">Select Options</option>
                <option value="standard">Standard</option>
                <option value="leed">LEED Certified</option>
                <option value="passive">Passive House</option>
                <option value="netZero">Net Zero</option>
                <option value="other">Other</option>
              </select>
              {errors.energyEfficiency && (
                <div className="constructionform-error-text">
                  {errors.energyEfficiency}
                </div>
              )}
            </div>
          </div>
          <div className="constructionform-form-group">
            <label
              htmlFor="specialRequirements"
              className="constructionform-required"
            >
              Special Requirements or Considerations
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              placeholder="List any special requirements, materials, or design considerations"
              value={formData.specialRequirements}
              onChange={handleInputChange}
            />
            {errors.specialRequirements && (
              <div className="constructionform-error-text">
                {errors.specialRequirements}
              </div>
            )}
          </div>
          <div className="constructionform-form-group">
            <label htmlFor="siteFiles">
              Site Plans or Additional Documents (Optional)
            </label>
            <input type="file" id="siteFiles" name="siteFiles" multiple />
          </div>
        </div>

        <div className="constructionform-submit-section">
          <button
            type="submit"
            className="constructionform-btn constructionform-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConstructionForm;
