const router = require('express').Router();

const contact = require('./contact.route')
const project = require('./project.route')

router.use('/contact',contact);
router.use('/project',project);

module.exports = router;