const express = require('express');
const router = express.Router();
const { submitArchitect, submitDesignRequest, submitConstructionForm, getProjects, getProjectById, getEditProject, updateProject, submitBid, acceptBid, declineBid, acceptWorkerRequest, rejectWorkerRequest } = require('../controllers/projectController');
const isAuthenticated = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post('/architect_submit', isAuthenticated, upload.array('referenceImages', 10), submitArchitect);
router.post('/design_request', isAuthenticated, upload.any(), submitDesignRequest);
router.post('/construction_form', isAuthenticated, upload.any(), submitConstructionForm);
router.get('/api/projects', getProjects);
router.get('/api/projects/:id', getProjectById);
router.get('/edit-project/:id', isAuthenticated, getEditProject);
router.post('/api/projects/update', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 10 }, { name: 'updateImages', maxCount: 1 }]), updateProject);
router.post('/customer/submit-bid', isAuthenticated, submitBid);
router.post('/customer/accept-bid', isAuthenticated, acceptBid);
router.post('/customer/decline-bid', isAuthenticated, declineBid);
router.post('/company/worker-request/accept', isAuthenticated, acceptWorkerRequest);
router.post('/company/worker-request/reject', isAuthenticated, rejectWorkerRequest);

module.exports = router;