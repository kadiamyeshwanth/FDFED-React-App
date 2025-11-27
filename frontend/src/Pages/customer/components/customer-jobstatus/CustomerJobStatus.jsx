import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./CustomerJobStatus.css";

const CustomerJobStatus = () => {
  const [activeTab, setActiveTab] = useState("cjs-architect-section");
  const [applications, setApplications] = useState({
    architect: [],
    interior: [],
    company: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobStatus = async () => {
      try {
        const res = await axios.get("/api/job_status", {
          withCredentials: true,
        });
        const data = res.data;

        setApplications({
          architect: data.architectApplications || [],
          interior: data.interiorApplications || [],
          company: data.companyApplications || [],
        });
      } catch (err) {
        console.error("Failed to load job status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobStatus();
  }, []);

  const handleTabClick = (tabId) => setActiveTab(tabId);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const renderProposal = (app, type) => {
    const isProposalSent = ["proposal_sent", "Proposal Sent"].includes(
      app.status
    );
    const isAccepted = app.status?.toLowerCase() === "accepted";

    if (isProposalSent && app.proposal) {
      return (
        <div className="cjs-proposal-section">
          <div className="cjs-proposal-price">
            ₹{app.proposal.price.toLocaleString("en-IN")}
          </div>
          <p className="cjs-proposal-description">{app.proposal.description}</p>
          <Link
            to={`/customer/accept-proposal/${type}/${app._id}`}
            className="cjs-btn-accept-pay"
          >
            Accept & Pay
          </Link>
        </div>
      );
    }

    if (isAccepted && app.proposal) {
      return (
        <p style={{ color: "green" }}>
          Accepted job for ₹{app.proposal.price.toLocaleString("en-IN")}
        </p>
      );
    }

    return (
      <p>
        Waiting for the {type === "company" ? "company" : type} to submit a
        proposal.
      </p>
    );
  };

  const renderArchitectApp = (app) => (
    <div key={app._id} className="cjs-application cjs-architect-app">
      <div className="cjs-status-container">
        <div className="cjs-status cjs-architect-status">{app.status}</div>
        {app.status?.toLowerCase() === "accepted" && app.chatId && (
          <Link
            to={`/chat/${app.chatId}`}
            className="cjs-chat-button cjs-architect-chat"
          >
            Chat
          </Link>
        )}
      </div>
      <h3>
        <span className="cjs-project-name">{app.projectName}</span>
        {app.worker?.name && ` with ${app.worker.name}`}
      </h3>
      <div className="cjs-date-info">
        Submitted: {formatDate(app.createdAt)}
      </div>

      <div className="cjs-application-data-section">
        <div className="cjs-application-data">
          <div className="cjs-section-title">Customer Details</div>
          <p>
            <strong>Name:</strong> {app.customerDetails?.fullName}
          </p>
          <p>
            <strong>Email:</strong> {app.customerDetails?.email}
          </p>
          <p>
            <strong>Contact:</strong> {app.customerDetails?.contactNumber}
          </p>
        </div>

        <div className="cjs-application-data">
          <div className="cjs-section-title">Customer Address</div>
          <p>
            <strong>Street:</strong> {app.customerAddress?.streetAddress}
          </p>
          <p>
            <strong>City:</strong> {app.customerAddress?.city}
          </p>
          <p>
            <strong>State:</strong> {app.customerAddress?.state}
          </p>
          <p>
            <strong>Zip Code:</strong> {app.customerAddress?.zipCode}
          </p>
        </div>

        <div className="cjs-application-data">
          <div className="cjs-section-title">Plot Information</div>
          <p>
            <strong>Location:</strong> {app.plotInformation?.plotLocation}
          </p>
          <p>
            <strong>Size:</strong> {app.plotInformation?.plotSize}
          </p>
          <p>
            <strong>Orientation:</strong> {app.plotInformation?.plotOrientation}
          </p>
        </div>

        <div className="cjs-application-data">
          <div className="cjs-section-title">Design Requirements</div>
          <p>
            <strong>Type:</strong> {app.designRequirements?.designType}
          </p>
          <p>
            <strong>Floors:</strong> {app.designRequirements?.numFloors}
          </p>
          <p>
            <strong>Special Features:</strong>{" "}
            {app.designRequirements?.specialFeatures || "None specified"}
          </p>
          <p>
            <strong>Style:</strong> {app.designRequirements?.architecturalStyle}
          </p>
        </div>

        {app.designRequirements?.floorRequirements?.length > 0 && (
          <div className="cjs-application-data">
            <div className="cjs-section-title">Floor Requirements</div>
            {app.designRequirements.floorRequirements.map((floor, i) => (
              <p key={i}>
                <strong>Floor {floor.floorNumber}:</strong> {floor.details}
              </p>
            ))}
          </div>
        )}

        <div className="cjs-application-data">
          <div className="cjs-section-title">Additional Details</div>
          <p>
            <strong>Budget:</strong>{" "}
            {app.additionalDetails?.budget || "Not specified"}
          </p>
          <p>
            <strong>Completion Date:</strong>{" "}
            {app.additionalDetails?.completionDate
              ? formatDate(app.additionalDetails.completionDate)
              : "Not specified"}
          </p>
          {app.additionalDetails?.referenceImages?.length > 0 && (
            <p>
              <strong>Images:</strong>{" "}
              {app.additionalDetails.referenceImages.length} uploaded
            </p>
          )}
        </div>

        <div className="cjs-application-data cjs-proposal-container">
          {renderProposal(app, "architect")}
        </div>
      </div>
    </div>
  );

  const renderInteriorApp = (app) => (
    <div key={app._id} className="cjs-application cjs-interior-app">
      <div className="cjs-status-container">
        <div className="cjs-status cjs-interior-status">{app.status}</div>
        {app.status?.toLowerCase() === "accepted" && app.chatId && (
          <Link
            to={`/chat/${app.chatId}`}
            className="cjs-chat-button cjs-interior-chat"
          >
            Chat
          </Link>
        )}
      </div>
      <h3 className="cjs-project-name">{app.projectName}</h3>
      <p>
        <strong>Email:</strong> {app.email}
      </p>

      <div className="cjs-section-title">Room Details</div>
      <p>
        <strong>Type:</strong> {app.roomType}
      </p>
      <p>
        <strong>Size:</strong> {app.roomSize?.length}×{app.roomSize?.width}
        {app.roomSize?.unit}
      </p>
      <p>
        <strong>Ceiling:</strong> {app.ceilingHeight?.height}
        {app.ceilingHeight?.unit}
      </p>
      <p>
        <strong>Preference:</strong> {app.designPreference}
      </p>
      <p>
        <strong>Description:</strong> {app.projectDescription}
      </p>

      {app.currentRoomImages?.length > 0 && (
        <>
          <h4 className="cjs-image-title">Current Room Images</h4>
          {app.currentRoomImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Current ${i + 1}`}
              className="cjs-room-image"
            />
          ))}
        </>
      )}

      {app.inspirationImages?.length > 0 && (
        <>
          <h4 className="cjs-image-title">Inspiration Images</h4>
          {app.inspirationImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Inspiration ${i + 1}`}
              className="cjs-room-image"
            />
          ))}
        </>
      )}

      <div className="cjs-proposal-container">
        {renderProposal(app, "interior")}
      </div>
    </div>
  );

  const renderCompanyApp = (app) => (
    <div key={app._id} className="cjs-application cjs-company-app">
      <div className="cjs-status-container">
        <div className="cjs-status cjs-company-status">{app.status}</div>
        {app.status?.toLowerCase() === "accepted" && app.chatId && (
          <Link
            to={`/chat/${app.chatId}`}
            className="cjs-chat-button cjs-company-chat"
          >
            Chat
          </Link>
        )}
      </div>
      <h3>
        <span className="cjs-project-name">{app.projectName}</span>
        {app.companyId?.name && ` with ${app.companyId.name}`}
      </h3>
      <div className="cjs-date-info">
        Submitted: {formatDate(app.createdAt)}
      </div>

      <div className="cjs-section-title">Customer Information</div>
      <p>
        <strong>Name:</strong> {app.customerName}
      </p>
      <p>
        <strong>Email:</strong> {app.customerEmail}
      </p>
      <p>
        <strong>Phone:</strong> {app.customerPhone}
      </p>

      <div className="cjs-section-title">Project Details</div>
      <p>
        <strong>Address:</strong> {app.projectAddress}
      </p>
      <p>
        <strong>Pincode:</strong> {app.projectLocationPincode || "N/A"}
      </p>
      <p>
        <strong>Area:</strong> {app.totalArea} sq.m
      </p>
      <p>
        <strong>Type:</strong> {app.buildingType}
      </p>
      {app.estimatedBudget && (
        <p>
          <strong>Budget:</strong> ₹
          {app.estimatedBudget.toLocaleString("en-IN")}
        </p>
      )}
      {app.projectTimeline && (
        <p>
          <strong>Timeline:</strong> {app.projectTimeline} months
        </p>
      )}

      <div className="cjs-section-title">Building Details</div>
      <p>
        <strong>Floors:</strong> {app.totalFloors}
      </p>

      <div className="cjs-section-title">Additional Requirements</div>
      <p>
        <strong>Special:</strong> {app.specialRequirements || "None specified"}
      </p>
      <p>
        <strong>Accessibility:</strong>{" "}
        {app.accessibilityNeeds || "None specified"}
      </p>
      <p>
        <strong>Energy:</strong> {app.energyEfficiency || "Standard"}
      </p>
      {app.siteFiles?.length > 0 && (
        <p>
          <strong>Files:</strong> {app.siteFiles.length} uploaded
        </p>
      )}

      <div className="cjs-proposal-container">
        {renderProposal(app, "company")}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="cjs-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          Loading your applications...
        </div>
      </div>
    );
  }

  return (
    <div className="cjs-container">
      <div className="cjs-tab-container">
        <div
          className={`cjs-tab ${
            activeTab === "cjs-architect-section" ? "cjs-active" : ""
          }`}
          onClick={() => handleTabClick("cjs-architect-section")}
        >
          Architect Applications
        </div>
        <div
          className={`cjs-tab ${
            activeTab === "cjs-interior-section" ? "cjs-active" : ""
          }`}
          onClick={() => handleTabClick("cjs-interior-section")}
        >
          Interior Designer Applications
        </div>
        <div
          className={`cjs-tab ${
            activeTab === "cjs-company-section" ? "cjs-active" : ""
          }`}
          onClick={() => handleTabClick("cjs-company-section")}
        >
          Construction Company Applications
        </div>
      </div>

      <div
        id="cjs-architect-section"
        className={`cjs-content-section ${
          activeTab === "cjs-architect-section" ? "cjs-active" : ""
        }`}
      >
        <h2 className="cjs-architect-heading">
          Architects You Requested to Join
        </h2>
        <p>Track the status of your applications to join architects</p>
        {applications.architect.length > 0 ? (
          applications.architect.map(renderArchitectApp)
        ) : (
          <div className="cjs-no-applications">
            <p>You haven't submitted any architect applications yet.</p>
          </div>
        )}
      </div>

      <div
        id="cjs-interior-section"
        className={`cjs-content-section ${
          activeTab === "cjs-interior-section" ? "cjs-active" : ""
        }`}
      >
        <h2 className="cjs-interior-heading">
          Interior Designers You Requested to Join
        </h2>
        <p>Track the status of your applications to join interior designers</p>
        {applications.interior.length > 0 ? (
          applications.interior.map(renderInteriorApp)
        ) : (
          <div className="cjs-no-applications">
            <p>You haven't submitted any interior designer applications yet.</p>
          </div>
        )}
      </div>

      <div
        id="cjs-company-section"
        className={`cjs-content-section ${
          activeTab === "cjs-company-section" ? "cjs-active" : ""
        }`}
      >
        <h2 className="cjs-company-heading">
          Construction Companies You Requested to Join
        </h2>
        <p>
          Track the status of your applications to join construction companies
        </p>
        {applications.company.length > 0 ? (
          <div className="cjs-company-app-container">
            {applications.company.map(renderCompanyApp)}
          </div>
        ) : (
          <div className="cjs-no-applications">
            <p>
              You haven't submitted any construction company applications yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerJobStatus;
