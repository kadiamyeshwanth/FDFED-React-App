// src/Pages/customer/components/customer-interior/CustomerInterior.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerInterior.css";

const CustomerInterior = () => {
  const [designers, setDesigners] = useState([]);
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const leftSectionRef = useRef(null);
  const rightContentRef = useRef(null);

  useEffect(() => {
    // Fetch interior designers from backend
    axios
      .get("/api/interior_designer") // Adjust endpoint as needed
      .then((response) => {
        setDesigners(response.data.designers || []);
      })
      .catch((error) => {
        console.error("Error fetching designers:", error);
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

  const handleCardClick = (id) => {
    setSelectedDesignerId(id);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!selectedDesignerId) {
      alert("Please select an interior designer before booking.");
      return;
    }
    navigate(`/customerdashboard/interiordesign_form?workerId=${selectedDesignerId}`);
  };

  const filteredDesigners = designers.filter(
    (designer) =>
      designer.availability === "available" &&
      (designer.name.toLowerCase().includes(searchTerm) ||
        (designer.professionalTitle || "Interior Designer")
          .toLowerCase()
          .includes(searchTerm))
  );

  return (
    <>
      <div className="interior-heading">Interior Designers</div>
      <div className="interior-container">
        <div className="interior-left-section" ref={leftSectionRef}>
          <div className="interior-search-box" style={{ position: "relative" }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search interior designers..."
              id="designerSearch"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {filteredDesigners.length > 0 ? (
            filteredDesigners.map((designer) => (
              <div
                key={designer._id}
                className={`interior-designer-card ${
                  selectedDesignerId === designer._id ? "active" : ""
                }`}
                data-id={designer._id}
                onClick={() => handleCardClick(designer._id)}
              >
                <img
                  src={
                    designer.profileImage ||
                    "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"
                  }
                  alt={designer.name}
                  className="interior-designer-image-small"
                />
                <div className="interior-designer-info">
                  <h3>{designer.name}</h3>
                  <p>{designer.professionalTitle || "Interior Designer"}</p>
                  <p>
                    <i className="fas fa-briefcase"></i> {designer.experience}{" "}
                    years experience
                  </p>
                  <div className="interior-rating">
                    {[...Array(Math.floor(designer.rating))].map((_, i) => (
                      <span key={i} className="interior-star">
                        ★
                      </span>
                    ))}
                    {designer.rating % 1 >= 0.5 && (
                      <span className="interior-star">½</span>
                    )}
                    <span className="interior-rating-count">
                      ({designer.rating})
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="interior-no-designers">
              <p>No interior designers are currently available.</p>
            </div>
          )}
        </div>

        <div className="interior-i_right_section">
          <div
            className="interior-right-content"
            id="designerDetails"
            ref={rightContentRef}
          >
            {!selectedDesignerId ? (
              <div className="interior-initial-message">
                <div className="interior-company-info">
                  <h2>Welcome to Build & Beyond Interior Designers</h2>
                  <p>
                    Build & Beyond Interior Designers is a premier firm
                    specializing in creating beautiful, functional spaces that
                    reflect your personal style. With years of experience, our
                    team has transformed countless homes and commercial spaces
                    into stunning environments.
                  </p>
                  <h3>Our Mission</h3>
                  <p>
                    To create spaces that inspire and enhance daily life through
                    innovative design solutions.
                  </p>
                  <h3>Our Services</h3>
                  <ul>
                    <li>Residential Interior Design</li>
                    <li>Commercial Interior Design</li>
                    <li>Space Planning</li>
                    <li>Color Consultation</li>
                    <li>Furniture Selection</li>
                    <li>Custom Millwork</li>
                  </ul>
                </div>
              </div>
            ) : (
              designers
                .filter(
                  (des) =>
                    des.availability === "available" &&
                    des._id === selectedDesignerId
                )
                .map((designer) => (
                  <div
                    key={designer._id}
                    className="interior-designer-details active"
                    id={`designer-${designer._id}`}
                  >
                    <div className="interior-designer-header">
                      <img
                        src={
                          designer.profileImage ||
                          "https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg"
                        }
                        alt={designer.name}
                        className="interior-designer-image-large"
                      />
                      <div className="interior-designer-header-content">
                        <h2>{designer.name}</h2>
                        <p>
                          <strong>
                            {designer.professionalTitle || "Interior Designer"}
                          </strong>
                        </p>
                        <p>
                          <i className="fas fa-briefcase"></i>{" "}
                          {designer.experience} years experience
                        </p>
                        <div className="interior-rating">
                          {[...Array(Math.floor(designer.rating))].map(
                            (_, i) => (
                              <span key={i} className="interior-star">
                                ★
                              </span>
                            )
                          )}
                          {designer.rating % 1 >= 0.5 && (
                            <span className="interior-star">½</span>
                          )}
                          <span className="interior-rating-count">
                            ({designer.rating})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="interior-bio">
                      <h3>About</h3>
                      <p>{designer.about || "Information not available"}</p>
                      {designer.specialties &&
                        designer.specialties.length > 0 && (
                          <div className="interior-specialties">
                            {designer.specialties.map((specialty, i) => (
                              <span key={i} className="interior-specialty">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="interior-projects">
                      <h3>Notable Projects</h3>
                      {designer.projects && designer.projects.length > 0 ? (
                        designer.projects.map((project, i) => (
                          <div key={i} className="interior-project">
                            <h4>{project.name}</h4>
                            <div className="interior-project-meta">
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
                              className="interior-project-image"
                            />
                            <p>{project.description}</p>
                          </div>
                        ))
                      ) : (
                        <p>No projects available for this designer.</p>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="interior-book-now-container">
            <form id="bookDesignerForm" onSubmit={handleBookSubmit}>
              <input
                type="hidden"
                name="workerId"
                id="selectedWorkerId"
                value={selectedDesignerId || ""}
              />
              <button
                type="submit"
                className="interior-book-now-btn"
                id="bookNowBtn"
                disabled={!selectedDesignerId}
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

export default CustomerInterior;
