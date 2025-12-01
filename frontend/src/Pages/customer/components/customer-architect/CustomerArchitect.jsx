// src/Pages/customer/components/customer-architect/CustomerArchitect.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerArchitect.css";

const CustomerArchitect = () => {
  const [architects, setArchitects] = useState([]);
  const [selectedArchitectId, setSelectedArchitectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const leftSectionRef = useRef(null);
  const rightContentRef = useRef(null);

  useEffect(() => {
    axios
      .get("/api/architect")
      .then((response) => {
        setArchitects(response.data.architects || []);
      })
      .catch((error) => {
        console.error("Error fetching architects:", error);
      });
  }, []);

  useEffect(() => {
    const preventScrollChaining = (section) => {
      section.addEventListener(
        "wheel",
        (event) => {
          const delta = event.deltaY;
          const scrollTop = section.scrollTop;
          const scrollHeight = section.scrollHeight;
          const clientHeight = section.clientHeight;

          if (
            (delta > 0 && scrollTop + clientHeight >= scrollHeight - 1) ||
            (delta < 0 && scrollTop <= 0)
          ) {
            event.preventDefault();
          }
        },
        { passive: false }
      );
    };

    if (leftSectionRef.current) preventScrollChaining(leftSectionRef.current);
    if (rightContentRef.current) preventScrollChaining(rightContentRef.current);
  }, []);

  const handleCardClick = (id) => setSelectedArchitectId(id);
  const handleSearchChange = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!selectedArchitectId) {
      alert("Please select an architect before booking.");
      return;
    }
    navigate(
      `/customerdashboard/architect_form?workerId=${selectedArchitectId}`
    );
  };

  const filteredArchitects = architects.filter(
    (architect) =>
      architect.availability === "available" &&
      (architect.name.toLowerCase().includes(searchTerm) ||
        (architect.professionalTitle || "Architect")
          .toLowerCase()
          .includes(searchTerm))
  );

  return (
    <>
      <div className="ca-heading">Architects</div>
      <div className="ca-container">
        <div className="ca-left-section" ref={leftSectionRef}>
          <div className="ca-search-box">
            <input
              type="text"
              placeholder="Search architects..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {filteredArchitects.length > 0 ? (
            filteredArchitects.map((architect) => (
              <div
                key={architect._id}
                className={`ca-architect-card ${
                  selectedArchitectId === architect._id ? "ca-active" : ""
                }`}
                onClick={() => handleCardClick(architect._id)}
              >
                <img
                  src={
                    architect.profileImage ||
                    "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"
                  }
                  alt={architect.name}
                  className="ca-architect-image-small"
                />
                <div className="ca-architect-info">
                  <h3>{architect.name}</h3>
                  <p>{architect.professionalTitle || "Architect"}</p>
                  <p>
                    <i className="fas fa-briefcase"></i> {architect.experience}{" "}
                    years experience
                  </p>
                  <div className="ca-rating">
                    {[...Array(Math.floor(architect.rating))].map((_, i) => (
                      <span key={i} className="ca-star">
                        ★
                      </span>
                    ))}
                    {architect.rating % 1 >= 0.5 && (
                      <span className="ca-star">½</span>
                    )}
                    <span className="ca-rating-count">
                      ({architect.rating})
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ca-no-architects">
              <p>No architects are currently available.</p>
            </div>
          )}
        </div>

        <div className="ca-right-section">
          <div className="ca-right-content" ref={rightContentRef}>
            {!selectedArchitectId ? (
              <div className="ca-initial-message">
                <div className="ca-company-info">
                  <h2 className="ca-text-heading">
                    Welcome to Build & Beyond Architects
                  </h2>
                  <p>
                    Build & Beyond Architects is a leading architectural firm
                    dedicated to creating innovative and sustainable designs
                    that inspire and transform communities. With over 20 years
                    of experience, our team of talented architects and designers
                    has delivered award-winning projects across the globe.
                  </p>
                  <h3 className="ca-text-heading">Our Mission</h3>
                  <p>
                    Our mission is to design spaces that enhance the quality of
                    life, promote sustainability, and reflect the unique
                    identity of our clients. We believe in the power of
                    architecture to shape the future and create lasting impact.
                  </p>
                  <h3 className="ca-text-heading">Our Services</h3>
                  <ul>
                    <li>Residential Architecture</li>
                    <li>Commercial Architecture</li>
                    <li>Urban Planning</li>
                    <li>Interior Design</li>
                    <li>Historic Preservation</li>
                    <li>Sustainable Design</li>
                  </ul>
                </div>
              </div>
            ) : (
              architects
                .filter(
                  (arch) =>
                    arch.availability === "available" &&
                    arch._id === selectedArchitectId
                )
                .map((architect) => (
                  <div
                    key={architect._id}
                    className="ca-architect-details ca-active"
                  >
                    <div className="ca-architect-header">
                      <img
                        src={
                          architect.profileImage ||
                          "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"
                        }
                        alt={architect.name}
                        className="ca-architect-image-large"
                      />
                      <div className="ca-architect-header-content">
                        <h2>{architect.name}</h2>
                        <p>
                          <strong>
                            {architect.professionalTitle || "Architect"}
                          </strong>
                        </p>
                        <p>
                          <i className="fas fa-briefcase"></i>{" "}
                          {architect.experience} years experience
                        </p>
                        <div className="ca-rating">
                          {[...Array(Math.floor(architect.rating))].map(
                            (_, i) => (
                              <span key={i} className="ca-star">
                                ★
                              </span>
                            )
                          )}
                          {architect.rating % 1 >= 0.5 && (
                            <span className="ca-star">½</span>
                          )}
                          <span className="ca-rating-count">
                            ({architect.rating})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ca-bio">
                      <h3>About</h3>
                      <p>{architect.about || "Information not available"}</p>
                      {architect.specialties &&
                        architect.specialties.length > 0 && (
                          <div className="ca-specialties">
                            {architect.specialties.map((specialty, i) => (
                              <span key={i} className="ca-specialty">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="ca-projects">
                      <h3>Notable Projects</h3>
                      {architect.projects && architect.projects.length > 0 ? (
                        architect.projects.map((project, i) => (
                          <div key={i} className="ca-project">
                            <h4>{project.name}</h4>
                            <div className="ca-project-meta">
                              <span>
                                <i className="fas fa-calendar-alt"></i>{" "}
                                {project.year}
                              </span>
                              <span>
                                <i className="fas fa-map-marker-alt"></i>{" "}
                                {project.location}
                              </span>
                            </div>
                            <img
                              src={
                                project.image ||
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC7-RFA1wE4wTSP0DZJSJ1AJ8TitBYtkmEYA&s"
                              }
                              alt={project.name}
                              className="ca-project-image"
                            />
                            <p>{project.description}</p>
                          </div>
                        ))
                      ) : (
                        <p>No projects available for this architect.</p>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="ca-book-now-container">
            <form onSubmit={handleBookSubmit}>
              <input
                type="hidden"
                name="workerId"
                value={selectedArchitectId || ""}
              />
              <button
                type="submit"
                className="ca-book-now-btn"
                disabled={!selectedArchitectId}
              >
                Book Consultation <i className="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerArchitect;
