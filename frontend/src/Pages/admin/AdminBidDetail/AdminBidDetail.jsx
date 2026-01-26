import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Card,
  PageHeader,
  Section,
  DataRow,
  Badge,
  ActionButton,
  Spinner,
} from "../../../components/admin/AdminUIComponents";
import "./AdminBidDetail.css";

const AdminBidDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBid = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/bid/${id}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setBid(data.bid ?? data);
      } catch (err) {
        setError(err.message || "Failed to load bid");
      } finally {
        setLoading(false);
      }
    };
    fetchBid();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this bid?")) return;
    try {
      const res = await fetch(`/api/admin/delete-bid/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      alert(data.message || "Deleted");
      navigate("/admin/admindashboard");
    } catch (err) {
      alert("Error deleting bid: " + err.message);
    }
  };

  const formatNumber = (n) =>
    typeof n === "number" ? n.toLocaleString() : n ?? "Not specified";

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <Spinner size="lg" />
          <p>Loading bid details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="error-container">
          <h2>Error Loading Bid</h2>
          <p>{error}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!bid) {
    return (
      <AdminLayout>
        <div className="error-container">
          <h2>Bid Not Found</h2>
          <ActionButton
            label="Back to Dashboard"
            variant="primary"
            onClick={() => navigate("/admin/admindashboard")}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="detail-page">
        {/* Page Header */}
        <PageHeader
          title="Bid Details"
          subtitle={`Bid ID: ${bid._id}`}
          actions={
            <div className="header-actions">
              <ActionButton
                label="Back"
                icon={ArrowLeft}
                variant="secondary"
                onClick={() => navigate("/admin/admindashboard")}
              />
              <ActionButton
                label="Delete"
                icon={Trash2}
                variant="danger"
                onClick={handleDelete}
              />
            </div>
          }
        />

        {/* Bid Overview */}
        <Section title="Bid Overview">
          <div className="overview-grid">
            <Card>
              <DataRow label="Status">
                <Badge variant={bid.status}>{bid.status}</Badge>
              </DataRow>
              <DataRow label="Total Companies">{(bid.companyBids || []).length}</DataRow>
              <DataRow label="Created Date">
                {new Date(bid.createdAt).toLocaleDateString()}
              </DataRow>
              <DataRow label="Last Updated">
                {new Date(bid.updatedAt).toLocaleDateString()}
              </DataRow>
            </Card>
          </div>
        </Section>

        {/* Customer Information */}
        <Section title="Customer Information">
          <Card>
            <DataRow label="Name">
              {bid.customerName ?? bid.customer?.name ?? "—"}
            </DataRow>
            <DataRow label="Email">
              {bid.customerEmail ?? bid.customer?.email ?? "—"}
            </DataRow>
            <DataRow label="Phone">
              {bid.customerPhone ?? bid.customer?.phone ?? "—"}
            </DataRow>
            <DataRow label="Address">
              {bid.projectAddress ?? "—"}
            </DataRow>
            <DataRow label="Location">
              {bid.projectLocation ?? "—"}
            </DataRow>
          </Card>
        </Section>

        {/* Project Details */}
        <Section title="Project Details">
          <div className="details-grid">
            <Card>
              <DataRow label="Building Type">
                {bid.buildingType ?? "—"}
              </DataRow>
              <DataRow label="Total Area">
                {formatNumber(bid.totalArea)} sq ft
              </DataRow>
              <DataRow label="Total Floors">
                {bid.totalFloors ?? "—"}
              </DataRow>
              <DataRow label="Estimated Budget">
                ₹{formatNumber(bid.estimatedBudget)}
              </DataRow>
              <DataRow label="Timeline">
                {bid.projectTimeline ?? "—"} months
              </DataRow>
              <DataRow label="Energy Efficiency">
                {bid.energyEfficiency ?? "Standard"}
              </DataRow>
            </Card>
            {bid.specialRequirements && (
              <Card>
                <h4 style={{ marginBottom: "12px", color: "#1f2937" }}>
                  Special Requirements
                </h4>
                <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                  {bid.specialRequirements}
                </p>
              </Card>
            )}
          </div>
        </Section>

        {/* Floor Details */}
        {Array.isArray(bid.floors) && bid.floors.length > 0 && (
          <Section title={`Floor Details (${bid.floors.length})`}>
            <div className="floors-grid">
              {bid.floors.map((floor, idx) => (
                <Card key={idx} className="floor-card">
                  <h4 className="floor-number">Floor {floor.floorNumber}</h4>
                  <DataRow label="Type">{floor.floorType}</DataRow>
                  <DataRow label="Area">
                    {floor.floorArea} sq ft
                  </DataRow>
                  {floor.floorDescription && (
                    <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>
                      {floor.floorDescription}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Company Bids */}
        <Section title={`Company Bids (${(bid.companyBids || []).length})`}>
          {bid.companyBids && bid.companyBids.length > 0 ? (
            <div className="bids-grid">
              {bid.companyBids.map((companyBid, idx) => (
                <Card key={idx} className="bid-card">
                  <div className="bid-header">
                    <h4 className="bid-company">
                      {idx + 1}. {companyBid.companyName ?? companyBid.company?.companyName ?? "Company"}
                    </h4>
                    <Badge variant={companyBid.status}>
                      {companyBid.status}
                    </Badge>
                  </div>
                  <DataRow label="Bid Price">
                    <strong>₹{formatNumber(companyBid.bidPrice)}</strong>
                  </DataRow>
                  <DataRow label="Bid Date">
                    {companyBid.bidDate
                      ? new Date(companyBid.bidDate).toLocaleDateString()
                      : "—"}
                  </DataRow>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="empty-card">
              <p style={{ color: "#6b7280", textAlign: "center" }}>
                No bids received yet
              </p>
            </Card>
          )}
        </Section>

        {/* Timestamps */}
        <Section title="Timestamps">
          <Card>
            <DataRow label="Created At">
              {new Date(bid.createdAt).toLocaleString()}
            </DataRow>
            <DataRow label="Last Updated">
              {new Date(bid.updatedAt).toLocaleString()}
            </DataRow>
          </Card>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default AdminBidDetail;
