const router = require('express').Router();
const projectController = require('../controller/projectController')

router.post('/new-project',projectController.newProject)

module.exports = router;