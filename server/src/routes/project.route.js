const router = require('express').Router();
const projectController = require('../controller/projectController')
const {uploadSingle} = require('../middleware/cloudinary.middleware')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')

// Any logged-in user (client) can submit a project - checked before the file
// upload runs so an unauthenticated request never reaches Cloudinary.
router.post('/new-project',verifyToken,uploadSingle,projectController.newProject)

// Admin-only: viewing and updating submitted projects.
router.get('/projects',verifyToken,requireAdmin,projectController.allAssignedProject)
router.post('/checkStatus',verifyToken,requireAdmin,projectController.completedProject)

module.exports = router;