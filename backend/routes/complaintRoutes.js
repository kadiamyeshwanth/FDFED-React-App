const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

// Submit a complaint (company/customer)
router.post('/', complaintController.submitComplaint);

// Get unviewed complaints count (admin dashboard)
router.get('/unviewed/count', complaintController.getUnviewedComplaintsCount);

// Get unviewed complaints count (company - only customer complaints)
router.get('/company/unviewed/count', complaintController.getCompanyUnviewedComplaintsCount);

// Get all complaints for a project (admin)
router.get('/:projectId', complaintController.getProjectComplaints);

// Admin reply to a complaint
router.post('/:complaintId/reply', complaintController.replyToComplaint);

module.exports = router;
