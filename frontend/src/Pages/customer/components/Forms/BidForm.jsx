import React, { useState } from "react";
import axios from "axios";
import "./BidForm.css";
import { useNavigate } from "react-router-dom";

const BidForm = () => {
  const navigate = useNavigate();
  const [totalFloors, setTotalFloors] = useState("");
  const [floors, setFloors] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleFloorCountChange = (e) => {
    const count = parseInt(e.target.value);
    setTotalFloors(e.target.value);
    if (count > 0) {
      const newFloors = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        floorType: "",
        floorArea: "",
        floorDescription: "",
        floorImage: null,
        preview: null,
      }));
      setFloors(newFloors);
    } else {
      setFloors([]);
    }
  };

  const updateFloor = (id, field, value) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const removeFloor = (id) => {
    setFloors((prev) => prev.filter((f) => f.id !== id));
  };

  const handleImageChange = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFloors((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, floorImage: file, preview: reader.result } : f
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const newErrors = {};

    const fields = [
      { id: "projectName", msg: "This field is required" },
      { id: "buildingType", msg: "This field is required" },
      { id: "customerName", msg: "This field is required" },
      { id: "customerEmail", msg: "Please enter a valid email address", validate: (v) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) },
      { id: "customerPhone", msg: "Please enter a valid 10-digit phone number", validate: (v) => /^\d{10}$/.test(v.replace(/\D/g, "")) },
      { id: "projectAddress", msg: "This field is required" },
      { id: "projectLocation", msg: "Please enter a valid 6-digit pincode", validate: (v) => /^\d{6}$/.test(v) },
      { id: "totalArea", msg: "Please enter a valid area (positive number)", validate: (v) => parseFloat(v) > 0 },
      { id: "estimatedBudget", msg: "Please enter a budget greater than ₹1,00,00,000", validate: (v) => parseFloat(v) > 10000000 },
      { id: "projectTimeline", msg: "Please enter a valid timeline (positive number)", validate: (v) => parseFloat(v) > 0 },
      { id: "specialRequirements", msg: "This field is required" },
      { id: "accessibilityNeeds", msg: "This field is required" },
      { id: "energyEfficiency", msg: "This field is required" },
    ];

    fields.forEach((f) => {
      const el = document.getElementById(f.id);
      const val = el?.value.trim() || "";
      if (!val) newErrors[f.id] = f.msg;
      else if (f.validate && !f.validate(val)) newErrors[f.id] = f.msg;
    });

    if (parseInt(totalFloors) > 0 && floors.length === 0) {
      newErrors.totalFloors = "Please generate floor details";
    } else {
      floors.forEach((f) => {
        if (!f.floorType) newErrors[`floorType-${f.id}`] = "This field is required";
        if (!f.floorArea || parseFloat(f.floorArea) <= 0) newErrors[`floorArea-${f.id}`] = "Please enter a valid floor area";
        if (!f.floorDescription.trim()) newErrors[`floorDescription-${f.id}`] = "This field is required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) {
      setFormError("Please correct the errors in the form before submitting");
      return;
    }

    const formData = new FormData();

    // Static fields
    formData.append("projectName", document.getElementById("projectName").value);
    formData.append("buildingType", document.getElementById("buildingType").value);
    formData.append("customerName", document.getElementById("customerName").value);
    formData.append("customerEmail", document.getElementById("customerEmail").value);
    formData.append("customerPhone", document.getElementById("customerPhone").value);
    formData.append("projectAddress", document.getElementById("projectAddress").value);
    formData.append("projectLocation", document.getElementById("projectLocation").value);
    formData.append("totalArea", document.getElementById("totalArea").value);
    formData.append("estimatedBudget", document.getElementById("estimatedBudget").value);
    formData.append("projectTimeline", document.getElementById("projectTimeline").value);
    formData.append("totalFloors", totalFloors);
    formData.append("specialRequirements", document.getElementById("specialRequirements").value);
    formData.append("accessibilityNeeds", document.getElementById("accessibilityNeeds").value);
    formData.append("energyEfficiency", document.getElementById("energyEfficiency").value);

    // Dynamic floors as nested object
    floors.forEach((f, i) => {
      formData.append(`floors[${i}][floorNumber]`, f.id);
      formData.append(`floors[${i}][floorType]`, f.floorType);
      formData.append(`floors[${i}][floorArea]`, f.floorArea);
      formData.append(`floors[${i}][floorDescription]`, f.floorDescription);
      if (f.floorImage) {
        formData.append("floorImages", f.floorImage);
      }
    });

    // Site files
    const siteFilesInput = document.getElementById("siteFiles");
    if (siteFilesInput.files) {
      Array.from(siteFilesInput.files).forEach((file) => {
        formData.append("siteFiles", file);
      });
    }

    try {
      const response = await axios.post("/api/bidForm_Submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.success) {
        alert("Project submitted successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Submission error:", err.response?.data || err);
      setFormError(err.response?.data?.error || "Submission failed. Please try again.");
    }
  };

  return (
    <div className="bf-container">
      <div className="bf-title-block">
        <h1>Construction Project Submission</h1>
      </div>

      <form id="bidForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="bf-form-section">
          <h2>Project Information</h2>
          <div className="bf-grid-2">
            <div className="bf-form-group">
              <label htmlFor="projectName" className="bf-required">Project Name</label>
              <input type="text" id="projectName" name="projectName" />
              <div className="bf-error-message" style={{ display: errors.projectName ? "block" : "none" }}>
                {errors.projectName}
              </div>
            </div>
            <div className="bf-form-group">
              <label htmlFor="buildingType" className="bf-required">Building Type</label>
              <select id="buildingType" name="buildingType">
                <option value="">Select Building Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="mixedUse">Mixed Use</option>
                <option value="other">Other</option>
              </select>
              <div className="bf-error-message" style={{ display: errors.buildingType ? "block" : "none" }}>
                {errors.buildingType}
              </div>
            </div>
          </div>
        </div>

        <div className="bf-form-section">
          <h2>Customer Information</h2>
          <div className="bf-grid-2">
            <div className="bf-form-group">
              <label htmlFor="customerName" className="bf-required">Full Name</label>
              <input type="text" id="customerName" name="customerName" />
              <div className="bf-error-message" style={{ display: errors.customerName ? "block" : "none" }}>
                {errors.customerName}
              </div>
            </div>
            <div className="bf-form-group">
              <label htmlFor="customerEmail" className="bf-required">Email Address</label>
              <input type="email" id="customerEmail" name="customerEmail" />
              <div className="bf-error-message" style={{ display: errors.customerEmail ? "block" : "none" }}>
                {errors.customerEmail}
              </div>
            </div>
          </div>
          <div className="bf-form-group">
            <label htmlFor="customerPhone" className="bf-required">Phone Number</label>
            <input type="tel" id="customerPhone" name="customerPhone" />
            <div className="bf-error-message" style={{ display: errors.customerPhone ? "block" : "none" }}>
              {errors.customerPhone}
            </div>
          </div>
        </div>

        <div className="bf-form-section">
          <h2>Project Details</h2>
          <div className="bf-form-group">
            <label htmlFor="projectAddress" className="bf-required">Project Address</label>
            <textarea id="projectAddress" name="projectAddress"></textarea>
            <div className="bf-error-message" style={{ display: errors.projectAddress ? "block" : "none" }}>
              {errors.projectAddress}
            </div>
          </div>

          <div className="bf-grid-2">
            <div className="bf-form-group">
              <label htmlFor="projectLocation" className="bf-required">Project Location Pincode</label>
              <input type="text" id="projectLocation" name="projectLocation" placeholder="e.g., 534260" />
              <div className="bf-error-message" style={{ display: errors.projectLocation ? "block" : "none" }}>
                {errors.projectLocation}
              </div>
            </div>
            <div className="bf-form-group">
              <label htmlFor="totalArea" className="bf-required">Total Building Area (square meters)</label>
              <input type="number" id="totalArea" name="totalArea" step="1" min="1" />
              <div className="bf-error-message" style={{ display: errors.totalArea ? "block" : "none" }}>
                {errors.totalArea}
              </div>
            </div>
          </div>

          <div className="bf-grid-2">
            <div className="bf-form-group">
              <label htmlFor="estimatedBudget" className="bf-required">Max Budget ₹</label>
              <input type="number" id="estimatedBudget" name="estimatedBudget" min="10000000" />
              <div className="bf-error-message" style={{ display: errors.estimatedBudget ? "block" : "none" }}>
                {errors.estimatedBudget}
              </div>
            </div>
            <div className="bf-form-group">
              <label htmlFor="projectTimeline" className="bf-required">Expected Timeline (months)</label>
              <input type="number" id="projectTimeline" name="projectTimeline" min="1" />
              <div className="bf-error-message" style={{ display: errors.projectTimeline ? "block" : "none" }}>
                {errors.projectTimeline}
              </div>
            </div>
          </div>
        </div>

        <div className="bf-form-section">
          <h2>Floor Plans</h2>
          <div className="bf-form-group">
            <label htmlFor="totalFloors" className="bf-required">Number of Floors</label>
            <input type="number" id="totalFloors" value={totalFloors} onChange={handleFloorCountChange} min="1" />
            <div className="bf-error-message" style={{ display: errors.totalFloors ? "block" : "none" }}>
              {errors.totalFloors}
            </div>
          </div>

          <div id="floorDetails">
            {floors.map((f) => (
              <div key={f.id} className="bf-floor-container">
                <div className="bf-floor-header">
                  <h3>Floor {f.id}</h3>
                  <button type="button" className="bf-btn bf-btn-remove" onClick={() => removeFloor(f.id)}>
                    Remove
                  </button>
                </div>
                <div className="bf-grid-2">
                  <div className="bf-form-group">
                    <label htmlFor={`floorType-${f.id}`} className="bf-required">Floor Type</label>
                    <select
                      id={`floorType-${f.id}`}
                      value={f.floorType}
                      onChange={(e) => updateFloor(f.id, "floorType", e.target.value)}
                    >
                      <option value="">Select Floor Type</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="parking">Parking</option>
                      <option value="mechanical">Mechanical/Utility</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="bf-error-message" style={{ display: errors[`floorType-${f.id}`] ? "block" : "none" }}>
                      {errors[`floorType-${f.id}`]}
                    </div>
                  </div>
                  <div className="bf-form-group">
                    <label htmlFor={`floorArea-${f.id}`} className="bf-required">Floor Area (sq meters)</label>
                    <input
                      type="number"
                      id={`floorArea-${f.id}`}
                      value={f.floorArea}
                      onChange={(e) => updateFloor(f.id, "floorArea", e.target.value)}
                      step="1"
                      min="1"
                    />
                    <div className="bf-error-message" style={{ display: errors[`floorArea-${f.id}`] ? "block" : "none" }}>
                      {errors[`floorArea-${f.id}`]}
                    </div>
                  </div>
                </div>
                <div className="bf-form-group">
                  <label htmlFor={`floorDescription-${f.id}`} className="bf-required">Floor Description</label>
                  <textarea
                    id={`floorDescription-${f.id}`}
                    value={f.floorDescription}
                    onChange={(e) => updateFloor(f.id, "floorDescription", e.target.value)}
                    placeholder="Describe the layout and purpose of this floor"
                  ></textarea>
                  <div className="bf-error-message" style={{ display: errors[`floorDescription-${f.id}`] ? "block" : "none" }}>
                    {errors[`floorDescription-${f.id}`]}
                  </div>
                </div>
                <div className="bf-form-group">
                  <label htmlFor={`floorImage-${f.id}`}>Floor Plan Image (Optional)</label>
                  <input
                    type="file"
                    id={`floorImage-${f.id}`}
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(e) => handleImageChange(f.id, e.target.files[0])}
                  />
                  {f.preview && (
                    <img src={f.preview} alt="Preview" className="bf-image-preview" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bf-form-section">
          <h2>Additional Requirements</h2>
          <div className="bf-form-group">
            <label htmlFor="specialRequirements" className="bf-required">
              Special Requirements or Considerations
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              placeholder="List any special requirements, materials, or design considerations"
            ></textarea>
            <div className="bf-error-message" style={{ display: errors.specialRequirements ? "block" : "none" }}>
              {errors.specialRequirements}
            </div>
          </div>

          <div className="bf-grid-2">
            <div className="bf-form-group">
              <label htmlFor="accessibilityNeeds" className="bf-required">Accessibility Needs</label>
              <select id="accessibilityNeeds" name="accessibilityNeeds">
                <option value="">Select Options</option>
                <option value="wheelchair">Wheelchair Accessibility</option>
                <option value="elevators">Elevators</option>
                <option value="ramps">Ramps</option>
                <option value="other">Other</option>
                <option value="none">None</option>
              </select>
              <div className="bf-error-message" style={{ display: errors.accessibilityNeeds ? "block" : "none" }}>
                {errors.accessibilityNeeds}
              </div>
            </div>
            <div className="bf-form-group">
              <label htmlFor="energyEfficiency" className="bf-required">Energy Efficiency Goals</label>
              <select id="energyEfficiency" name="energyEfficiency">
                <option value="">Select Options</option>
                <option value="standard">Standard</option>
                <option value="leed">LEED Certified</option>
                <option value="passive">Passive House</option>
                <option value="netZero">Net Zero</option>
                <option value="other">Other</option>
              </select>
              <div className="bf-error-message" style={{ display: errors.energyEfficiency ? "block" : "none" }}>
                {errors.energyEfficiency}
              </div>
            </div>
          </div>

          <div className="bf-form-group">
            <label htmlFor="siteFiles">Site Plans or Additional Documents (Optional)</label>
            <input type="file" id="siteFiles" name="siteFiles" multiple />
          </div>
        </div>

        <div className="bf-submit-section">
          <div className="bf-error-message" style={{ display: formError ? "block" : "none" }}>
            {formError}
          </div>
          <button type="submit" className="bf-btn bf-submit-btn">
            Submit Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidForm;