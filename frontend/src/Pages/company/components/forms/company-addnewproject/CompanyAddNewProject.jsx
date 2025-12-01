import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./CompanyAddNewProject.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const CompanyAddNewProject = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const updateCheckpoint = searchParams.get("updateCheckpoint");
  const navigate = useNavigate();

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [milestoneMessage, setMilestoneMessage] = useState("");
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [targetCompletionDate, setTargetCompletionDate] = useState("");
  const [currentPhase, setCurrentPhase] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [updateText, setUpdateText] = useState("");
  const [updateImage, setUpdateImage] = useState(null);
  const [existingMilestones, setExistingMilestones] = useState([]);
  const [maxCompletedMilestone, setMaxCompletedMilestone] = useState(0);
  const [nextCheckpoint, setNextCheckpoint] = useState(25);
  const [revisionMode, setRevisionMode] = useState(false);
  const [customerFeedback, setCustomerFeedback] = useState("");

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/companyongoing_projects", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load projects");
        const json = await res.json();
        const found = (json.projects || []).find((p) => p._id === projectId);
        if (found) {
          setCompletionPercentage(found.completionPercentage || 0);
          setTargetCompletionDate(found.targetCompletionDate ? new Date(found.targetCompletionDate).toISOString().split("T")[0] : "");
          setCurrentPhase(found.currentPhase || "");
          setExistingMilestones(found.milestones || []);
          
          // Calculate max completed milestone
          if (found.milestones && found.milestones.length > 0) {
            const max = Math.max(...found.milestones.map(m => m.percentage));
            setMaxCompletedMilestone(max);
          }
          
          // Calculate next checkpoint
          const checkpoints = [25, 50, 75, 100];
          const approvedCheckpoints = (found.milestones || []).filter(m => m.isCheckpoint && m.isApprovedByCustomer).map(m => m.percentage);
          const lastApproved = approvedCheckpoints.length > 0 ? Math.max(...approvedCheckpoints) : 0;
          const next = checkpoints.find(c => c > lastApproved) || 100;
          setNextCheckpoint(next);

          // Check if loading for revision update
          if (updateCheckpoint) {
            const checkpointNum = parseInt(updateCheckpoint);
            const milestone = found.milestones.find(m => m.percentage === checkpointNum && m.isCheckpoint);
            if (milestone && milestone.needsRevision) {
              setRevisionMode(true);
              setSelectedMilestone(checkpointNum.toString());
              setMilestoneMessage(milestone.companyMessage || "");
              setCustomerFeedback(milestone.customerFeedback || "");
              setShowMilestoneInput(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setErrors([err.message || "Failed to load project data"]);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId, updateCheckpoint]);

  const validateFile = (file) => {
    if (!file) return true;
    if (!allowedTypes.includes(file.type)) return false;
    if (file.size > MAX_FILE_SIZE) return false;
    return true;
  };

  const handleMilestoneChange = (value) => {
    setSelectedMilestone(value);
    const checkpoints = [25, 50, 75, 100];
    const isCheckpoint = checkpoints.includes(parseInt(value));
    
    if (value && isCheckpoint) {
      setShowMilestoneInput(true);
    } else {
      setShowMilestoneInput(false);
      setMilestoneMessage("");
    }
  };

  const getMaxAllowedPercentage = () => {
    // If in revision mode, allow updating the same checkpoint
    if (revisionMode) {
      return parseInt(selectedMilestone);
    }
    
    // Check if there's a pending checkpoint waiting for approval
    const pendingCheckpoint = existingMilestones.find(
      m => m.isCheckpoint && !m.isApprovedByCustomer && !m.needsRevision
    );
    
    if (pendingCheckpoint) {
      return null; // Can't update until checkpoint is approved
    }
    
    return nextCheckpoint; // Can update up to next checkpoint
  };

  const getCheckpointFloor = () => {
    const checkpoints = [25, 50, 75, 100];
    const reached = existingMilestones
      .filter(m => m.isCheckpoint)
      .map(m => m.percentage);
    if (reached.length === 0) return 0;
    return Math.max(...reached);
  };

  const validate = () => {
    const v = [];
    const today = new Date();
    
    if (selectedMilestone) {
      const milestone = parseInt(selectedMilestone);
      const checkpoints = [25, 50, 75, 100];
      const isCheckpoint = checkpoints.includes(milestone);
      const floor = getCheckpointFloor();

      if (isCheckpoint && !milestoneMessage.trim()) {
        v.push(`Please add a message for the ${milestone}% checkpoint so the customer can review and approve.`);
      }
      // Cannot go below the last reached checkpoint (floor)
      if (milestone < floor) {
        v.push(`Progress cannot go below the last checkpoint (${floor}%).`);
      }
      const maxAllowed = getMaxAllowedPercentage();
      if (maxAllowed === null) {
        v.push("You cannot update progress until the previous checkpoint has been approved by the customer.");
      } else if (milestone > maxAllowed) {
        v.push(`You can adjust between ${floor}% and ${maxAllowed}% only. Reach and get approval for ${maxAllowed}% to move further.`);
      }
    }
    if (milestoneMessage && milestoneMessage.length > 500) {
      v.push("Milestone message cannot exceed 500 characters");
    }
    
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
      
      // Add milestone data if selected
      if (selectedMilestone) {
        formData.append("milestonePercentage", selectedMilestone);
        const checkpoints = [25, 50, 75, 100];
        const isCheckpoint = checkpoints.includes(parseInt(selectedMilestone));
        if (isCheckpoint && milestoneMessage.trim()) {
          formData.append("milestoneMessage", milestoneMessage);
        } else if (!isCheckpoint) {
          formData.append("milestoneMessage", `Progress update to ${selectedMilestone}%`);
        }
      }
      
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

      {revisionMode && customerFeedback && (
        <div style={{
          backgroundColor: "#fff3cd",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h3 style={{ marginTop: 0, color: "#856404" }}>⚠ Customer Revision Request</h3>
          <p style={{ marginBottom: "10px" }}>
            <strong>Customer Feedback:</strong>
          </p>
          <p style={{ 
            backgroundColor: "white", 
            padding: "15px", 
            borderRadius: "6px",
            marginBottom: "10px",
            lineHeight: "1.6"
          }}>
            {customerFeedback}
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: "0.95em" }}>
            Please update your message below to address the customer's concerns.
          </p>
        </div>
      )}

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
          <label htmlFor="currentCompletion">Current Project Completion</label>
          <div className="progress-display">
            <span className="completion-badge">{completionPercentage}% Complete</span>
            {completionPercentage > 0 && (
              <span className="milestone-info">
                Next Checkpoint: {nextCheckpoint}%
                {existingMilestones.find(m => m.percentage === nextCheckpoint && m.isCheckpoint && !m.isApprovedByCustomer)
                  ? " ⏳ Awaiting Customer Approval" 
                  : " (Available)"}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="milestoneSelection">Update Project Progress (%)</label>
          <input
            type="number"
            id="milestoneSelection" 
            value={selectedMilestone} 
            onChange={(e) => handleMilestoneChange(e.target.value)}
            className="form-control"
            min={getCheckpointFloor()}
            max={getMaxAllowedPercentage() ?? getCheckpointFloor()}
            placeholder={`Enter progress (${getCheckpointFloor()} - ${(getMaxAllowedPercentage() ?? getCheckpointFloor())})`}
          />
          {getMaxAllowedPercentage() === null && (
            <small style={{ color: "#ff6b6b", display: "block", marginTop: "5px" }}>
              Waiting for customer approval of checkpoint before proceeding
            </small>
          )}
          {getMaxAllowedPercentage() !== null && (
            <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
              You may adjust progress between {getCheckpointFloor()}% and {getMaxAllowedPercentage()}%. Reaching {getMaxAllowedPercentage()}% creates a checkpoint requiring approval.
            </small>
          )}
          {completionPercentage === 100 && (
            <small style={{ color: "#51cf66", display: "block", marginTop: "5px" }}>
              Project fully completed!
            </small>
          )}
        </div>

        {showMilestoneInput && (
          <div className="form-group milestone-message-box" style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "15px", 
            borderRadius: "8px", 
            border: "2px solid #4CAF50" 
          }}>
            <label htmlFor="milestoneMessage">
              Progress Update Message for {selectedMilestone}% Completion
              <span style={{ color: "#666", fontSize: "0.9em", display: "block", marginTop: "5px" }}>
                {[25, 50, 75, 100].includes(parseInt(selectedMilestone)) 
                  ? `This is a CHECKPOINT at ${selectedMilestone}%. Customer approval required before proceeding further.`
                  : "Describe what has been completed and any queries for the customer"}
              </span>
            </label>
            <textarea
              id="milestoneMessage"
              value={milestoneMessage}
              onChange={(e) => setMilestoneMessage(e.target.value)}
              rows="4"
              placeholder={`Example: We have reached ${selectedMilestone}% completion. ${[25, 50, 75, 100].includes(parseInt(selectedMilestone)) ? 'This is a checkpoint milestone. ' : ''}Describe the work completed and any questions for the customer.`}
              maxLength="500"
              required={!!selectedMilestone}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
            <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
              {milestoneMessage.length}/500 characters
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="completionPercentage">Checkpoint Progress Overview</label>
          <div className="milestones-overview" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {[25, 50, 75, 100].map(milestone => {
              const isCompleted = existingMilestones.some(m => m.percentage === milestone && m.isCheckpoint);
              const milestoneData = existingMilestones.find(m => m.percentage === milestone && m.isCheckpoint);
              const isApproved = milestoneData?.isApprovedByCustomer;
              
              return (
                <div 
                  key={milestone}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    textAlign: "center",
                    backgroundColor: isCompleted ? (isApproved ? "#d4edda" : "#fff3cd") : "#e9ecef",
                    border: `2px solid ${isCompleted ? (isApproved ? "#28a745" : "#ffc107") : "#dee2e6"}`,
                    fontSize: "0.9em"
                  }}
                >
                  <strong>{milestone}%</strong>
                  <div style={{ fontSize: "0.8em", marginTop: "5px" }}>
                    {isCompleted ? (isApproved ? "✓ Approved" : "⏳ Pending") : "○ Not Started"}
                  </div>
                </div>
              );
            })}
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