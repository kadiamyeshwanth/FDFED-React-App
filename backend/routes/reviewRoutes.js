const express = require('express');
const router = express.Router();
const { submitCustomerReview, submitWorkerReview, getProjectReviewStatus } = require('../controllers/reviewController');
const auth = require('../middlewares/auth');
const isAuthenticated = require('../middlewares/auth');

// Customer submits review for worker
router.post('/customer/review', auth, submitCustomerReview);

// Worker submits review for customer
router.post('/worker/review', isAuthenticated, submitWorkerReview);

// Get project review status
router.get('/project-review-status/:projectType/:projectId', getProjectReviewStatus);

module.exports = router;
