const router = require('express').Router();

const contact = require('./contact.route')
const project = require('./project.route')
const User = require('./user.route')

router.use('/contact',contact);
router.use('/project',project);
router.use('/auth',User);

module.exports = router;