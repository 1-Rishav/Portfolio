const multer = require('multer')

// Multer Configuration - no destination/filename functions given, so multer
// writes to the OS temp directory with a random name; projectController's
// newProject cleans these up after each upload attempt.
const storage = multer.diskStorage({});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - generous for a project-brief PDF, prevents abuse

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // The Cloudinary upload call downstream hardcodes format: 'pdf', so
    // anything else uploaded would already be mislabeled there - this
    // filter just stops it earlier, before it's written to disk at all.
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed'));
  },
});

// Wraps upload.single('file') so multer's own errors (file too large, wrong
// type) come back as clean JSON instead of falling through to Express's
// default HTML error page - there's no global error handler in this app, so
// an uncaught multer error would otherwise render as HTML to what's meant
// to be a JSON API.
const uploadSingle = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File is too large - max ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }
    return res.status(400).json({ message: err.message || 'File upload failed' });
  });
};

module.exports = { upload, uploadSingle };
