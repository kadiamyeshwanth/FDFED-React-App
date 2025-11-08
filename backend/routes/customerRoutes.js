const express = require('express');
const router = express.Router();
const {
  submitBidForm,
  getDashboard,
  postConstructionForm,
  getJobRequestStatus,
  getConstructionCompaniesList,
  getArchitects,
  getArchitectForm,
  getOngoingProjects,
  getDesignIdeas,
  getInteriorDesignForm,
  getInteriorDesigners,
  getConstructionForm,
  getBidForm,
  getSettings,
  getBidSpace,
  // IMPORT NEW FAVORITES FUNCTIONS
  getFavorites,
  saveFavoriteDesign,
  removeFavoriteDesign,
  acceptProposal,
  acceptCompanyBid,acceptCompanyProposal,updatePassword,
  approveMilestone,
  rejectMilestone,
  requestMilestoneRevision,
  reportMilestoneToAdmin
} = require("../controllers/customerController");

const { submitCustomerReview, getProjectReviewStatus } = require('../controllers/reviewController');
const {upload} = require('../middlewares/upload')
const auth = require('../middlewares/auth'); // Import authentication middleware

// Public routes (no authentication required)
router.get('/home', getDashboard);
router.get('/customerdashboard', getDashboard);
router.get('/architect', getArchitects);
router.get('/architect_form', getArchitectForm);
router.get('/design_ideas', getDesignIdeas);
router.get("/constructionform", getConstructionForm);
router.post("/constructionform", auth, postConstructionForm);
router.post(
  "/bidForm_Submit",
  auth,
  upload.fields([
    { name: "siteFiles", maxCount: 10 },
    { name: "floorImages", maxCount: 100 },
  ]),
  submitBidForm
);
router.get('/bidform', getBidForm);

// Protected routes (require authentication)
router.post('/constructionform', auth, postConstructionForm);
router.get('/job_status', auth, getJobRequestStatus);
router.get('/construction_companies_list', auth, getConstructionCompaniesList);
router.get('/ongoing_projects', auth, getOngoingProjects);
router.get('/interiordesign_form', auth, getInteriorDesignForm);
router.get('/interior_designer', auth, getInteriorDesigners);
router.get('/customersettings', auth, getSettings);
router.get('/bidspace', auth, getBidSpace);


// FAVORITES API ROUTES (Same paths, but linked to new array logic)
router.get('/api/customer/favorites', auth, getFavorites);
router.post('/api/customer/favorites', auth, saveFavoriteDesign);
router.delete('/api/customer/favorites/:id', auth, removeFavoriteDesign);
router.get('/customer/accept-proposal/:type/:id', auth, acceptProposal);
router.get('/customer/accept-bid/:bidId/:companyBidId', auth, acceptCompanyBid);
router.get('/customer/accept-company-proposal/:projectId', auth, acceptCompanyProposal);
router.post('/customer/password/update', auth, updatePassword);
router.post('/customer/milestone/approve/:projectId/:milestoneId', auth, approveMilestone);
router.post('/customer/milestone/reject/:projectId/:milestoneId', auth, rejectMilestone);
router.post('/customer/milestone/request-revision/:projectId/:milestoneId', auth, requestMilestoneRevision);
router.post('/customer/milestone/report-to-admin/:projectId/:milestoneId', auth, reportMilestoneToAdmin);

// Review routes
router.post('/customer/review', auth, submitCustomerReview);
router.get('/customer/review-status/:projectType/:projectId', auth, getProjectReviewStatus);

module.exports = router;