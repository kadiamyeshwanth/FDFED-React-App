// src/Pages/customer/components/customer-ongoing/CustomerOngoing.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CustomerOngoing.css";

const CustomerOngoing = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [expandedDetails, setExpandedDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/ongoing_projects", {
          withCredentials: true,
        });
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error("Failed to load ongoing projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleDetails = (id) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.buildingType === filter);

  if (loading) {
    return (
      <>
        <div className="co-container">
          <div className="co-no-projects">
            <p>Loading ongoing projects...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="co-container">
        <div className="co-header">
          <h1>Ongoing Projects</h1>
        </div>

        <div className="co-content-wrapper">
          {/* LEFT SECTION */}
          <div className="co-left-section">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <React.Fragment key={project._id}>
                  {/* PROJECT CARD */}
                  <div className="co-project-display">
                    <div className="co-project-image">
                      <img
                        src={
                          project.mainImagePath ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqjSRsiV4Q22mOElSnkcct2oZmd-1iVrNOcQ&s"
                        }
                        alt={`${project.projectName} Image`}
                      />
                    </div>

                    <div className="co-project-details">
                      <h2>{project.projectName}</h2>

                      <div className="co-location">
                        <span>
                          <svg
                            className="co-location-icon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {project.projectAddress}
                        </span>
                      </div>

                      <div className="co-tags-container">
                        <span className="co-project-tag">
                          {project.buildingType
                            ? project.buildingType.charAt(0).toUpperCase() +
                              project.buildingType.slice(1)
                            : "Other"}
                        </span>
                      </div>

                      <div className="co-progress-container">
                        <div className="co-progress-bar">
                          <div
                            className="co-progress-fill"
                            style={{
                              width: `${project.completionPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="co-progress-text">
                          <span>
                            Project Completion:{" "}
                            <span className="co-progress-percentage">
                              {project.completionPercentage || 0}%
                            </span>
                          </span>
                          <span>
                            Target: {project.targetCompletionDate || "N/A"}
                          </span>
                        </div>
                      </div>

                      <p>
                        Current phase: {project.currentPhase || "Not specified"}
                      </p>

                      <div className="co-action-buttons">
                        <button
                          className="co-view-details-btn"
                          onClick={() => toggleDetails(project._id)}
                        >
                          {expandedDetails[project._id]
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE DETAILS */}
                  <div
                    className={`co-view-details ${
                      expandedDetails[project._id] ? "active" : ""
                    }`}
                    id={`details-${project._id}`}
                  >
                    {/* All Images */}
                    <h3>All Images</h3>
                    <div className="co-images">
                      {project.additionalImagePaths &&
                      project.additionalImagePaths.length > 0 ? (
                        project.additionalImagePaths.map((img, i) => (
                          <img key={i} src={img} alt={`Additional ${i + 1}`} />
                        ))
                      ) : (
                        <p>No images uploaded yet</p>
                      )}
                    </div>

                    {/* Recent Updates */}
                    <h3>Recent Updates</h3>
                    <div className="co-recent-updates">
                      {project.updates && project.updates.length > 0 ? (
                        project.updates.map((update, i) => (
                          <div key={i} className="co-update">
                            <img
                              src={update.image || "/images/update-default.jpg"}
                              alt="Update"
                            />
                            <p>{update.description}</p>
                          </div>
                        ))
                      ) : (
                        <div className="co-update">
                          <img
                            src="/images/update-default-1.jpg"
                            alt="Default"
                          />
                          <p>No updates yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Project Submission Details */}
                    <div className="co-project-submission-details">
                      <h3>Project Submission Details</h3>

                      <div className="co-section">
                        <h4>Customer Information</h4>
                        <p>
                          <strong>Full Name:</strong> {project.customerName}
                        </p>
                        <p>
                          <strong>Email Address:</strong>{" "}
                          {project.customerEmail}
                        </p>
                        <p>
                          <strong>Phone Number:</strong> {project.customerPhone}
                        </p>
                      </div>

                      <div className="co-section">
                        <h4>Project Details</h4>
                        <p>
                          <strong>Project Address:</strong>{" "}
                          {project.projectAddress}
                        </p>
                        <p>
                          <strong>Project Location:</strong>{" "}
                          {project.projectLocation}
                        </p>
                        <p>
                          <strong>Total Building Area:</strong>{" "}
                          {project.totalArea} sq meters
                        </p>
                        <p>
                          <strong>Building Type:</strong>{" "}
                          {project.buildingType
                            ? project.buildingType.charAt(0).toUpperCase() +
                              project.buildingType.slice(1)
                            : "Other"}
                        </p>
                        <p>
                          <strong>Estimated Budget:</strong>{" "}
                          {project.estimatedBudget
                            ? `$${project.estimatedBudget.toLocaleString()}`
                            : "None specified"}
                        </p>
                        <p>
                          <strong>Expected Timeline:</strong>{" "}
                          {project.projectTimeline
                            ? `${project.projectTimeline} months`
                            : "None specified"}
                        </p>
                      </div>

                      <div className="co-section">
                        <h4>Floor Plans</h4>
                        <p>
                          <strong>Total Floors:</strong> {project.totalFloors}
                        </p>
                        {project.floors && project.floors.length > 0 ? (
                          project.floors.map((floor, i) => (
                            <div key={i} className="co-floor-plan">
                              <p>
                                <strong>
                                  Floor {floor.floorNumber || i + 1}
                                </strong>
                              </p>
                              <p>
                                <strong>Floor Type:</strong>{" "}
                                {floor.floorType
                                  ? floor.floorType.charAt(0).toUpperCase() +
                                    floor.floorType.slice(1)
                                  : "Other"}
                              </p>
                              <p>
                                <strong>Floor Area:</strong>{" "}
                                {floor.floorArea || "None specified"} sq meters
                              </p>
                              <p>
                                <strong>Floor Description:</strong>{" "}
                                {floor.floorDescription || "None specified"}
                              </p>
                              {floor.floorImagePath ? (
                                <img
                                  src={floor.floorImagePath}
                                  alt={`Floor ${
                                    floor.floorNumber || i + 1
                                  } Plan`}
                                />
                              ) : (
                                <img
                                  src="/images/floor-default.jpg"
                                  alt="Default Floor Plan"
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="co-floor-plan">
                            <p>
                              <strong>Floor plans not yet available</strong>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="co-section">
                        <h4>Additional Requirements</h4>
                        <p>
                          <strong>Special Requirements:</strong>{" "}
                          {project.specialRequirements || "None specified"}
                        </p>
                        <p>
                          <strong>Accessibility Needs:</strong>{" "}
                          {project.accessibilityNeeds
                            ? project.accessibilityNeeds
                                .charAt(0)
                                .toUpperCase() +
                              project.accessibilityNeeds.slice(1)
                            : "None specified"}
                        </p>
                        <p>
                          <strong>Energy Efficiency Goals:</strong>{" "}
                          {project.energyEfficiency
                            ? project.energyEfficiency.charAt(0).toUpperCase() +
                              project.energyEfficiency.slice(1)
                            : "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="co-no-projects">
                <p>
                  No ongoing projects found. All accepted projects will appear
                  here.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SECTION - FILTERS */}
          <div className="co-rgt-section">
            <div className="co-filter-properties">
              <h2>Filter Properties</h2>
              <button
                className={`co-filter-button ${
                  filter === "all" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("all")}
              >
                All Properties
              </button>
              <button
                className={`co-filter-button ${
                  filter === "residential" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("residential")}
              >
                Residential
              </button>
              <button
                className={`co-filter-button ${
                  filter === "commercial" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("commercial")}
              >
                Commercial
              </button>
              <button
                className={`co-filter-button ${
                  filter === "industrial" ? "active" : "inactive"
                }`}
                onClick={() => setFilter("industrial")}
              >
                Industrial
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerOngoing;
