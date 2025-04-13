const router = require('express').Router();
const contactController = require('../controller/contactController')

//router.post('/home',contactController.contactHome);
router.post('/contactPage',contactController.contactPage);

module.exports = router;