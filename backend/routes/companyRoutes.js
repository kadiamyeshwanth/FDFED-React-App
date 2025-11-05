const express = require('express');
const router = express.Router();
const multer = require('multer');  // Ensure this is imported
const { getDashboard, getOngoingProjects, getProjectRequests, updateProjectStatusController, 
    getHiring, getSettings, getBids, getCompanyRevenue, 
    createHireRequest, updateCompanyProfile, handleWorkerRequest, submitBidController, submitProjectProposal, getEmployees} = require('../controllers/companyController');
const isAuthenticated = require('../middlewares/auth');

// Create a Multer instance (no storage needed since no file uploads)
const upload = multer();

router.get('/companydashboard', isAuthenticated, getDashboard);
router.get('/companyongoing_projects', isAuthenticated, getOngoingProjects);
router.get('/project_requests', isAuthenticated, getProjectRequests);
router.patch('/api/projects/:projectId/:status', isAuthenticated, updateProjectStatusController);
router.get('/companyhiring', isAuthenticated, getHiring);

// FIXED: Add upload.any() middleware here to parse FormData
router.post('/companytoworker', isAuthenticated, upload.any(), createHireRequest);

router.get('/companysettings', isAuthenticated, getSettings);
router.get('/companybids', isAuthenticated, getBids);
router.get('/companyrevenue', isAuthenticated, getCompanyRevenue);
router.get('/my-employees', isAuthenticated, getEmployees);
router.get('/revenue_form', isAuthenticated, (req, res) => {
  res.render('company/revenue_form');
});
router.patch('/worker-request/:requestId', isAuthenticated, handleWorkerRequest);
router.post('/update-company-profile', isAuthenticated, upload.any(), updateCompanyProfile);
router.post('/submit-bid', isAuthenticated, submitBidController);
router.post('/company/submit-proposal', isAuthenticated, submitProjectProposal);

module.exports = router;