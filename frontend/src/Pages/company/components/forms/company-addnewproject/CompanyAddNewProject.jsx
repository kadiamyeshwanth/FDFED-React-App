import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./CompanyAddNewProject.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const CompanyAddNewProject = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [targetCompletionDate, setTargetCompletionDate] = useState("");
  const [currentPhase, setCurrentPhase] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [updateText, setUpdateText] = useState("");
  const [updateImage, setUpdateImage] = useState(null);

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/company/companyongoing_projects", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load projects");
        const json = await res.json();
        const found = (json.projects || []).find((p) => p._id === projectId);
        if (found) {
          setCompletionPercentage(found.completionPercentage || 0);
          setTargetCompletionDate(found.targetCompletionDate ? new Date(found.targetCompletionDate).toISOString().split("T")[0] : "");
          setCurrentPhase(found.currentPhase || "");
          // other fields may be populated as needed
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  const validateFile = (file) => {
    if (!file) return true;
    if (!allowedTypes.includes(file.type)) return false;
    if (file.size > MAX_FILE_SIZE) return false;
    return true;
  };

  const validate = () => {
    const v = [];
    const today = new Date();
    if (completionPercentage < 0 || completionPercentage > 100) v.push("Completion percentage must be between 0 and 100");
    if (!targetCompletionDate) v.push("Target completion date is required");
    else if (new Date(targetCompletionDate) <= today) v.push("Target completion date must be in the future");
    if (!currentPhase) v.push("Current phase is required");
    if (mainImage && !validateFile(mainImage)) v.push("Main file must be PDF/JPG/PNG and <= 5MB");
    for (let f of additionalImages) if (!validateFile(f)) { v.push("Each additional file must be PDF/JPG/PNG and <= 5MB"); break; }
    if (updateText && updateText.length > 500) v.push("Update text cannot exceed 500 characters");
    if (updateImage && !validateFile(updateImage)) v.push("Update image must be PDF/JPG/PNG and <= 5MB");
    setErrors(v);
    return v.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const formData = new FormData();
      if (projectId) formData.append("projectId", projectId);
      formData.append("completionPercentage", completionPercentage);
      formData.append("targetCompletionDate", targetCompletionDate);
      formData.append("currentPhase", currentPhase);
      if (mainImage) formData.append("mainImage", mainImage);
      additionalImages.forEach((file) => formData.append("additionalImages", file));
      if (updateText) formData.append("updates[]", updateText);
      if (updateImage) formData.append("updateImages", updateImage);

      // original EJS used action "/api/projects/update"; keep that path
      const res = await fetch("http://localhost:3000/api/projects/update", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to save project");

      // navigate back to ongoing projects
      navigate("/companydashboard/companyongoing_projects");

    } catch (err) {
      console.error(err);
      setErrors([err.message || String(err)]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>{projectId ? "Edit Construction Project" : "Add New Project"}</h1>

      {errors.length > 0 && (
        <div className="validation-summary" style={{ display: "block" }}>
          <p>Please correct the following errors:</p>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form id="constructionProjectForm" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="hidden" name="projectId" value={projectId || ""} />

        <div className="form-group">
          <label htmlFor="completionPercentage">Project Completion Percentage</label>
          <div className="progress-container">
            <div className="progress-input">
              <input
                type="range"
                id="completionPercentage"
                name="completionPercentage"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Number(e.target.value))}
              />
              <span id="progressValue" className="progress-value">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="targetCompletionDate">Target Completion Date</label>
          <input
            type="date"
            id="targetCompletionDate"
            name="targetCompletionDate"
            value={targetCompletionDate}
            onChange={(e) => setTargetCompletionDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentPhase">Current Phase</label>
          <select id="currentPhase" name="currentPhase" value={currentPhase} onChange={(e) => setCurrentPhase(e.target.value)} required>
            <option value="">Select current phase</option>
            <option value="Foundation">Foundation</option>
            <option value="Structure">Structure</option>
            <option value="Interior work">Interior work</option>
            <option value="Finishing">Finishing</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mainImage">Main Project File</label>
          <input type="file" id="mainImage" name="mainImage" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setMainImage(e.target.files[0] || null)} />
        </div>

        <div className="form-group">
          <label htmlFor="additionalImages">Additional Project Files</label>
          <input type="file" id="additionalImages" name="additionalImages" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => setAdditionalImages(Array.from(e.target.files || []))} />
        </div>

        <div className="form-group">
          <label>Recent Updates</label>
          <div className="update-container">
            <div className="form-group">
              <label htmlFor="update1">Update 1</label>
              <textarea id="update1" name="updates[]" rows="3" placeholder="e.g. Interior work is progressing as planned." value={updateText} onChange={(e) => setUpdateText(e.target.value)}></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="updateImage1">Update File</label>
              <input type="file" id="updateImage1" name="updateImages" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setUpdateImage(e.target.files[0] || null)} />
            </div>
          </div>
        </div>

        <div className="btn-container">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Project"}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("companyongoing_projects")}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CompanyAddNewProject;