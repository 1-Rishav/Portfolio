const router = require('express').Router();
const projectController = require('../controller/projectController')
const {upload} = require('../middleware/cloudinary.middleware')
router.post('/new-project',upload.single('file'),projectController.newProject)

module.exports = router;