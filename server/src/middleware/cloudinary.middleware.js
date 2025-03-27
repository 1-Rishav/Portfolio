const multer = require('multer')
const path = require('path');


// Multer Configuration
const storage = multer.diskStorage({});
const upload = multer({ storage });

module.exports = { upload };