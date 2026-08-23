const router = require('express').Router();
const contactController = require('../controller/contactController')
const { verifyToken, requireAdmin } = require('../middleware/auth.middleware')

// Public - visitors should never need to log in just to send a message.
//router.post('/home',contactController.contactHome);
router.post('/contactPage',contactController.contactPage);

// Admin-only: viewing and updating contact submissions.
router.get('/connections',verifyToken,requireAdmin,contactController.allConnection);
router.post('/checkConnection',verifyToken,requireAdmin,contactController.connected)

module.exports = router;