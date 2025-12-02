// src/Pages/customer/components/customer-interior/CustomerInterior.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerInterior.css";
// Import the new sub-components
import DesignerList from "./sub-components/DesignerList";
import DesignerDetails from "./sub-components/DesignerDetails";
import CompanyIntroInterior from "./sub-components/CompanyIntroInterior";

const CustomerInterior = () => {
  const [designers, setDesigners] = useState([]);
  const [selectedDesignerId, setSelectedDesignerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const leftSectionRef = useRef(null);
  const rightContentRef = useRef(null);

  // --- Data Fetching (Unchanged) ---
  useEffect(() => {
    axios
      .get("/api/interior_designer")
      .then((response) => {
        setDesigners(response.data.designers || []);
      })
      .catch((error) => {
        console.error("Error fetching designers:", error);
      });
  }, []);

  // --- Scroll Chaining Prevention (Unchanged) ---
  useEffect(() => {
    const preventScrollChaining = (section) => {
      // ... (Scroll Chaining Prevention Logic) ...
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

  // --- Handlers ---
  const handleCardClick = (id) => setSelectedDesignerId(id);
  const handleSearchChange = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!selectedDesignerId) {
      alert("Please select an interior designer before booking.");
      return;
    }
    navigate(
      `/customerdashboard/interiordesign_form?workerId=${selectedDesignerId}`
    );
  };

  // --- Filtering Logic (Moved from JSX) ---
  const filteredDesigners = designers.filter(
    (designer) =>
      designer.name.toLowerCase().includes(searchTerm) ||
      (designer.professionalTitle || "Interior Designer")
        .toLowerCase()
        .includes(searchTerm)
  );

  // --- Finding Selected Designer for Details (New) ---
  const selectedDesigner = designers.find(
    (des) => des._id === selectedDesignerId
  );

  return (
    <>
      <div className="interior-heading">Interior Designers</div>
      <div className="interior-container">
        {/* LEFT SECTION (Designer List and Search) */}
        <DesignerList
          leftSectionRef={leftSectionRef}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          filteredDesigners={filteredDesigners}
          selectedDesignerId={selectedDesignerId}
          handleCardClick={handleCardClick}
        />

        {/* RIGHT SECTION (Details or Intro) */}
        <div className="interior-i_right_section">
          <div
            className="interior-right-content"
            id="designerDetails"
            ref={rightContentRef}
          >
            {!selectedDesignerId ? (
              <CompanyIntroInterior />
            ) : (
              <DesignerDetails designer={selectedDesigner} />
            )}
          </div>

          {/* BOOK NOW BUTTON */}
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
