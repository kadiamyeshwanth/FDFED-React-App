const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  deleteCustomer,
  deleteCompany,
  deleteWorker,
  deleteArchitectHiring,
  deleteConstructionProject,
  deleteDesignRequest,
  deleteBid,
  deleteJobApplication,
  getCustomerDetail,
  getCompanyDetail,
  getWorkerDetail,
  getArchitectHiringDetail,
  getConstructionProjectDetail,
  getDesignRequestDetail,
  getBidDetail,
  getJobApplicationDetail,
  verifyCompany,
  rejectCompany,
  verifyWorker,
  rejectWorker,
  getAdminRevenue,
} = require("../controllers/adminController");

const authadmin = require("../middlewares/authadmin");

// Admin login route
router.post("/admin/login", authadmin);

// Admin session verification route
router.get("/admin/verify-session", authadmin, (req, res) => {
  res.json({ authenticated: true, role: "admin" });
});

// Admin logout route
router.post("/admin/logout", (req, res) => {
  res.clearCookie("admin_token", { path: "/" });
  res.json({ message: "Logged out successfully" });
});

// Routes to verify or reject companies and workers
router.patch("/admin/verify-company/:id", authadmin, verifyCompany);
router.patch("/admin/reject-company/:id", authadmin, rejectCompany);
router.patch("/admin/verify-worker/:id", authadmin, verifyWorker);
router.patch("/admin/reject-worker/:id", authadmin, rejectWorker);

// Admin dashboard route (protected)
router.get("/admindashboard", authadmin, getAdminDashboard);

// Admin revenue analytics route (protected)
router.get("/admin/revenue", authadmin, getAdminRevenue);

// Delete routes
router.delete("/admin/delete-customer/:id", authadmin, deleteCustomer);
router.delete("/admin/delete-company/:id", authadmin, deleteCompany);
router.delete("/admin/delete-worker/:id", authadmin, deleteWorker);
router.delete(
  "/admin/delete-architectHiring/:id",
  authadmin,
  deleteArchitectHiring,
);
router.delete(
  "/admin/delete-constructionProject/:id",
  authadmin,
  deleteConstructionProject,
);
router.delete(
  "/admin/delete-designRequest/:id",
  authadmin,
  deleteDesignRequest,
);
router.delete("/admin/delete-bid/:id", authadmin, deleteBid);
router.delete(
  "/admin/delete-jobApplication/:id",
  authadmin,
  deleteJobApplication,
);

// Detail view routes
router.get("/admin/customer/:id", authadmin, getCustomerDetail);
router.get("/admin/company/:id", authadmin, getCompanyDetail);
router.get("/admin/worker/:id", authadmin, getWorkerDetail);
router.get("/admin/architect-hiring/:id", authadmin, getArchitectHiringDetail);
router.get(
  "/admin/construction-project/:id",
  authadmin,
  getConstructionProjectDetail,
);
router.get("/admin/design-request/:id", authadmin, getDesignRequestDetail);
router.get("/admin/bid/:id", authadmin, getBidDetail);
router.get("/admin/job-application/:id", authadmin, getJobApplicationDetail);

module.exports = router;
