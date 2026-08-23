const router = require('express').Router();
const UserController = require('../controller/userController')
const { verifyToken } = require('../middleware/auth.middleware')

router.post("/register",UserController.registerUser)
router.post("/login",UserController.loginUser)
router.get("/me",verifyToken,UserController.getCurrentUser)
router.post("/logout",UserController.logoutUser)

module.exports = router;