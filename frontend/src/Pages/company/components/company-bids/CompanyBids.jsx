// src/pages/company/CompanyBids.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./CompanyBids.css";

const CompanyBids = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("place-bid");
  const [bids, setBids] = useState([]);
  const [companyBids, setCompanyBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [alert, setAlert] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");

  const formRef = useRef(null);

  /* -------------------------------------------------
   *  1. Alerts from query string
   * -------------------------------------------------*/
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "bid_submitted") {
      setAlert({ type: "success", msg: "Your bid has been submitted successfully!" });
    } else if (error === "invalid_data") {
      setAlert({ type: "danger", msg: "Please provide a valid bid amount." });
    } else if (error === "server_error") {
      setAlert({ type: "danger", msg: "An error occurred while processing your bid. Please try again." });
    }

    if (success || error) {
      const p = new URLSearchParams(searchParams);
      p.delete("success");
      p.delete("error");
      setSearchParams(p);
    }
  }, [searchParams, setSearchParams]);

  /* -------------------------------------------------
   *  2. Load data — ONE FETCH ONLY
   * -------------------------------------------------*/
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/companybids", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch bids");

        const data = await res.json();

        setBids(data.bids || []);
        setCompanyBids(data.companyBids || []);
        setCompanyName(data.companyName || "");
        setCompanyId(data.companyId || "");

        const bidId = searchParams.get("bidId");
        if (bidId && data.bids) {
          const found = data.bids.find((b) => b._id === bidId);
          if (found) {
            setSelectedBid(found);
            setActiveTab("place-bid");
          }
        }
      } catch (e) {
        console.error("Error loading bids:", e);
        setAlert({ type: "danger", msg: "Failed to load bids. Please try again." });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  /* -------------------------------------------------
   *  3. Tab handling
   * -------------------------------------------------*/
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "bid-status") setSelectedBid(null);
  };

  /* -------------------------------------------------
   *  4. Card click → select bid + URL update
   * -------------------------------------------------*/
  const selectBid = (bid) => {
    setSelectedBid(bid);
    setBidAmount("");
    setSearchParams({ bidId: bid._id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* -------------------------------------------------
   *  5. Floor expand / collapse
   * -------------------------------------------------*/
  const toggleFloor = (bidId) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(bidId) ? n.delete(bidId) : n.add(bidId);
      return n;
    });
  };

  /* -------------------------------------------------
   *  6. Submit bid (budget validation)
   * -------------------------------------------------*/
  const submitBid = async (e) => {
    e.preventDefault();
    if (!selectedBid) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setAlert({ type: "danger", msg: "Please enter a valid bid amount greater than zero." });
      return;
    }

    if (selectedBid.estimatedBudget && amount > selectedBid.estimatedBudget) {
      setAlert({
        type: "danger",
        msg: `Bid amount (₹${amount.toLocaleString("en-IN")}) exceeds the budget (₹${selectedBid.estimatedBudget.toLocaleString("en-IN")}). Enter a lower amount.`,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/submit-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bidId: selectedBid._id,
          bidPrice: amount,
          companyName,
          companyId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSearchParams({ success: "bid_submitted" });
        setBidAmount("");
        window.location.reload(); // or refetch data
      } else {
        setAlert({ type: "danger", msg: data.error || "Failed to submit bid." });
      }
    } catch (e) {
      console.error("Error:", e);
      setAlert({ type: "danger", msg: "Network error. Please try again." });
    }
  };

  /* -------------------------------------------------
   *  Render helpers
   * -------------------------------------------------*/
  const visibleCompanyBids = companyBids.filter((b) => b.status !== "rejected");

  if (loading) {
    return <div className="bids-container"><p>Loading bids...</p></div>;
  }

  return (
    <div className="bids-container">
      {/* ALERT */}
      {alert && (
        <div className={`bids-alert bids-alert-${alert.type}`}>
          {alert.msg}
        </div>
      )}

      {/* TABS */}
      <div className="bids-nav-menu">
        <div
          className={`bids-nav-item ${activeTab === "place-bid" ? "bids-active" : ""}`}
          onClick={() => switchTab("place-bid")}
        >
          Place a Bid
        </div>
        <div
          className={`bids-nav-item ${activeTab === "bid-status" ? "bids-active" : ""}`}
          onClick={() => switchTab("bid-status")}
        >
          Bid Status
        </div>
      </div>

      {/* PLACE BID TAB */}
      {activeTab === "place-bid" && (
        <div className="bids-section bids-active">
          <div className="bids-grid">
            {/* LEFT */}
            <div className="bids-left">
              <h2>Available Projects</h2>
              <div className="bids-list">
                {bids.length ? (
                  bids.map((bid) => (
                    <div
                      key={bid._id}
                      className={`bids-card ${selectedBid?._id === bid._id ? "bids-selected" : ""}`}
                      onClick={() => selectBid(bid)}
                    >
                      <div className="bids-card-title">{bid.projectName || "Unnamed Project"}</div>
                      <div className="bids-card-subtitle">
                        {bid.buildingType} | {bid.totalFloors} Floors
                      </div>
                      <div className="bids-card-budget">
                        Est. Budget: ₹
                        {bid.estimatedBudget?.toLocaleString("en-IN") ?? "Not specified"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bids-empty">No projects available for bidding at the moment.</div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="bids-right">
              {!selectedBid ? (
                <div className="bids-placeholder">
                  <p>Click on a project to view details and place your bid</p>
                </div>
              ) : (
                <div className="bids-detail">
                  <h2>{selectedBid.projectName || "Project Details"}</h2>
                  <div className="bids-detail-budget">
                    Est. Budget: ₹
                    {selectedBid.estimatedBudget?.toLocaleString("en-IN") ?? "Not specified"}
                  </div>

                  <div className="bids-info">
                    <h3>Project Details</h3>
                    <div className="bids-info-row"><strong>Location:</strong> {selectedBid.projectLocation}</div>
                    <div className="bids-info-row"><strong>Address:</strong> {selectedBid.projectAddress}</div>
                    <div className="bids-info-row"><strong>Total Area:</strong> {selectedBid.totalArea} sq.ft</div>
                    <div className="bids-info-row"><strong>Timeline:</strong> {selectedBid.projectTimeline ?? "Not specified"} months</div>
                    <div className="bids-info-row"><strong>Total Floors:</strong> {selectedBid.totalFloors}</div>
                    <div className="bids-info-row"><strong>Building Type:</strong> {selectedBid.buildingType}</div>
                    <div className="bids-info-row"><strong>Accessibility Needs:</strong> {selectedBid.accessibilityNeeds ?? "None"}</div>
                    <div className="bids-info-row"><strong>Energy Efficiency:</strong> {selectedBid.energyEfficiency ?? "Standard"}</div>
                  </div>

                  <div className="bids-info">
                    <h3>Customer Information</h3>
                    <div className="bids-info-row"><strong>Name:</strong> {selectedBid.customerName}</div>
                    <div className="bids-info-row"><strong>Email:</strong> {selectedBid.customerEmail}</div>
                    <div className="bids-info-row"><strong>Phone:</strong> {selectedBid.customerPhone}</div>
                  </div>

                  {selectedBid.floors?.length > 0 && (
                    <div className="bids-info">
                      <h3>Floor Information ({selectedBid.floors.length} floors)</h3>
                      {selectedBid.floors.map((f) => (
                        <div key={f.floorNumber} className="bids-info-row">
                          <strong>Floor {f.floorNumber}:</strong> {f.floorType}
                          {f.area && ` | Area: ${f.area} sq.ft`}
                          {f.rooms && ` | Rooms: ${f.rooms}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedBid.siteFiles?.length > 0 && (
                    <div className="bids-info">
                      <h3>Site Files</h3>
                      {selectedBid.siteFiles.map((file, i) => (
                        <div key={i} className="bids-info-row">
                          <strong>File {i + 1}:</strong>{" "}
                          <a href={file} target="_blank" rel="noopener noreferrer" style={{ color: "var(--bids-primary)" }}>
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bids-form">
                    <h3>Place Your Bid</h3>
                    <form ref={formRef} onSubmit={submitBid}>
                      <div className="bids-form-group">
                        <label htmlFor="bids-amount">Your Bid Amount (₹):</label>
                        <input
                          id="bids-amount"
                          type="text"
                          required
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </div>
                      <button type="submit" className="bids-btn-primary">
                        Submit Bid
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BID STATUS TAB */}
      {activeTab === "bid-status" && (
        <div className="bids-section bids-active">
          <h2>Your Bid Status</h2>
          <div className="bids-status-list">
            {visibleCompanyBids.length > 0 ? (
              visibleCompanyBids.map((cb) => {
                const p = cb.project;
                const isExpanded = expanded.has(cb._id);
                const floorsToShow = isExpanded ? p.floors ?? [] : (p.floors ?? []).slice(0, 3);

                return (
                  <div key={cb._id} className="bids-status-card">
                    <div className="bids-status-header">
                      <div className="bids-status-info">
                        <div className="bids-status-title">
                          {p.projectName || "Project"} – {p.totalFloors} Floors
                        </div>
                        <div className="bids-status-budget">
                          Est. Budget: ₹
                          {p.estimatedBudget?.toLocaleString("en-IN") ?? "Not specified"}
                        </div>
                        <div className="bids-status-desc">
                          {p.specialRequirements || "No special requirements provided."}
                        </div>
                        <div className="bids-status-date">
                          Posted: {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </div>
                        <div className="bids-your-bid">
                          Your Bid: ₹{cb.bidPrice.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className={`bids-status-badge bids-status-${cb.status.toLowerCase()}`}>
                        {cb.status}
                      </div>
                    </div>

                    <div className="bids-status-grid">
                      <div className="bids-grid-item"><span className="bids-label">Location</span> {p.projectLocation}</div>
                      <div className="bids-grid-item"><span className="bids-label">Total Area</span> {p.totalArea} sq.ft</div>
                      <div className="bids-grid-item"><span className="bids-label">Timeline</span> {p.projectTimeline ?? "Not specified"} months</div>
                      <div className="bids-grid-item"><span className="bids-label">Building Type</span> {p.buildingType}</div>
                      <div className="bids-grid-item"><span className="bids-label">Accessibility</span> {p.accessibilityNeeds ?? "None"}</div>
                      <div className="bids-grid-item"><span className="bids-label">Energy Efficiency</span> {p.energyEfficiency ?? "Standard"}</div>
                    </div>

                    <div className="bids-customer">
                      <div className="bids-customer-title">Customer Information</div>
                      <div className="bids-customer-grid">
                        <div><strong>Name:</strong> {p.customerName}</div>
                        <div><strong>Email:</strong> {p.customerEmail}</div>
                        <div><strong>Phone:</strong> {p.customerPhone}</div>
                      </div>
                    </div>

                    {p.floors?.length > 0 && (
                      <div className="bids-floors">
                        <div className="bids-floors-title">
                          Floor Details ({p.floors.length} floors)
                        </div>
                        <div className="bids-floors-list">
                          {floorsToShow.map((f) => (
                            <div key={f.floorNumber} className="bids-floor-badge">
                              Floor {f.floorNumber}: {f.floorType}
                            </div>
                          ))}
                        </div>
                        {p.floors.length > 3 && (
                          <button className="bids-expand-btn" onClick={() => toggleFloor(cb._id)}>
                            {isExpanded ? "Show less" : `Show ${p.floors.length - 3} more floors`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bids-empty">You haven't placed any bids yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyBids;