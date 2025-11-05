const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// Import all necessary functions from the worker controller
const { 
    getJobs, 
    getJoinCompany, 
    getSettings, 
    getEditProfile, 
    getDashboard, 
    getWorkerById, 
    deleteWorkerRequest,
    createWorkerRequest,
    updateWorkerProfile,
    updateAvailability,
    acceptOffer,
    declineOffer,
    updateJobStatus,
    getOngoingProjects,
    postProjectUpdate,
    markProjectAsCompleted,
    submitProposal,
    updatePassword,
    getMyCompany,
    leaveCompany
} = require('../controllers/workerController');

const isAuthenticated = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

// --- Page Navigation Routes ---
router.get('/workerjobs', isAuthenticated, getJobs);
router.get('/workerjoin_company', isAuthenticated, getJoinCompany);
router.get('/workersettings', isAuthenticated, getSettings);
router.get('/worker_edit', isAuthenticated, getEditProfile); // Protected this route
router.get('/workerdashboard', isAuthenticated, getDashboard);
router.get('/worker/my-company', isAuthenticated, getMyCompany);


// --- API and Form Submission Routes ---
router.get('/api/workers/:id', isAuthenticated, getWorkerById);
router.delete('/api/worker-requests/:id', isAuthenticated, deleteWorkerRequest);

// Handle form submission for applying to a company
router.post('/worker_request/:companyId', isAuthenticated, upload.single("resume"), createWorkerRequest);

// Handle profile updates from the edit page
router.post('/worker/profile/update', isAuthenticated, upload.any(), updateWorkerProfile);

// Handle availability status changes
router.post('/worker/availability', isAuthenticated, updateAvailability);

// Handle accepting/declining company offers
router.post('/offers/:id/accept', isAuthenticated, acceptOffer);
router.post('/offers/:id/decline', isAuthenticated, declineOffer);

// --- THIS IS THE ROUTE FOR NEW JOBS ---
// This single route handles "Accept" and "Reject" for both Architect and Interior Designer jobs
router.post('/jobs/:id/status', isAuthenticated, updateJobStatus);
router.get('/worker/ongoing-projects', isAuthenticated, getOngoingProjects);
router.post('/worker/project-update', isAuthenticated, upload.single('updateImage'), postProjectUpdate);
router.post('/worker/project-complete', isAuthenticated, markProjectAsCompleted);
router.post('/worker/submit-proposal', isAuthenticated, submitProposal);
router.post('/worker/password/update', isAuthenticated, updatePassword);
router.post('/worker/leave-company', isAuthenticated, leaveCompany);
module.exports = router;