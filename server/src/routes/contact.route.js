const router = require('express').Router();
const contactController = require('../controller/contactController')

//router.post('/home',contactController.contactHome);
router.post('/contactPage',contactController.contactPage);
router.get('/connections',contactController.allConnection);
router.post('/checkConnection',contactController.connected)

module.exports = router;