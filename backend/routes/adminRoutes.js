const express = require('express');
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
  getJobApplicationDetail
} = require('../controllers/adminController');
const authadmin = require('../middlewares/authadmin');

// Admin dashboard route (protected)
router.get('/admindashboard', getAdminDashboard);

// Delete routes
router.delete('/admin/delete-customer/:id', deleteCustomer);
router.delete('/admin/delete-company/:id', deleteCompany);
router.delete('/admin/delete-worker/:id', deleteWorker);
router.delete('/admin/delete-architectHiring/:id', deleteArchitectHiring);
router.delete('/admin/delete-constructionProject/:id', deleteConstructionProject);
router.delete('/admin/delete-designRequest/:id', deleteDesignRequest);
router.delete('/admin/delete-bid/:id', deleteBid);
router.delete('/admin/delete-jobApplication/:id', deleteJobApplication);

// Detail view routes
router.get('/admin/customer/:id', getCustomerDetail);
router.get('/admin/company/:id', getCompanyDetail);
router.get('/admin/worker/:id', getWorkerDetail);
router.get('/admin/architect-hiring/:id', getArchitectHiringDetail);
router.get('/admin/construction-project/:id', getConstructionProjectDetail);
router.get('/admin/design-request/:id', getDesignRequestDetail);
router.get('/admin/bid/:id', getBidDetail);
router.get('/admin/job-application/:id', getJobApplicationDetail);

module.exports = router;