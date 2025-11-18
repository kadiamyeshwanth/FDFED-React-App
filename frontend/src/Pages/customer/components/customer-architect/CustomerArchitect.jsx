// src/Pages/customer/components/customer-architect/CustomerArchitect.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerArchitect.css";
// Import the new sub-components
import ArchitectList from "./sub-components/ArchitectList";
import ArchitectDetails from "./sub-components/ArchitectDetails";
import CompanyIntro from "./sub-components/CompanyIntro";

const CustomerArchitect = () => {
  const [architects, setArchitects] = useState([]);
  const [selectedArchitectId, setSelectedArchitectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const leftSectionRef = useRef(null);
  const rightContentRef = useRef(null);

  // --- Data Fetching (Unchanged) ---
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

  // --- Filtering Logic (Moved from JSX) ---
  const filteredArchitects = architects.filter(
    (architect) =>
      architect.name.toLowerCase().includes(searchTerm) ||
      (architect.professionalTitle || "Architect")
        .toLowerCase()
        .includes(searchTerm)
  );

  // --- Finding Selected Architect for Details (New) ---
  const selectedArchitect = architects.find(
    (arch) => arch._id === selectedArchitectId
  );

  return (
    <>
      <div className="ca-heading">Architects</div>
      <div className="ca-container">
        {/* LEFT SECTION (Architect List and Search) */}
        <ArchitectList
          leftSectionRef={leftSectionRef}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          filteredArchitects={filteredArchitects}
          selectedArchitectId={selectedArchitectId}
          handleCardClick={handleCardClick}
        />

        {/* RIGHT SECTION (Details or Intro) */}
        <div className="ca-right-section">
          <div className="ca-right-content" ref={rightContentRef}>
            {!selectedArchitectId ? (
              <CompanyIntro />
            ) : (
              <ArchitectDetails architect={selectedArchitect} />
            )}
          </div>

          {/* BOOK NOW BUTTON */}
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
