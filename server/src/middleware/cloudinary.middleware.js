const multer = require('multer')
const fs = require('fs')

// Multer Configuration - no destination/filename functions given, so multer
// writes to the OS temp directory with a random name; projectController's
// newProject cleans these up after each upload attempt.
const storage = multer.diskStorage({});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - generous for a project-brief PDF, prevents abuse

// Real PDFs always start with these exact 5 bytes ("%PDF-", the start of the
// "%PDF-1.x" header required by the PDF spec). Checking this - rather than
// trusting the mimetype string below, which is just a label the client sends
// and can say anything - is what actually confirms the uploaded content.
const PDF_SIGNATURE = Buffer.from('%PDF-', 'ascii');

// Reads only the first 5 bytes of the file on disk - not the whole upload -
// to confirm it's a genuine PDF. Returns false (never throws) for any read
// failure, so a bad path or race just fails the check safely.
async function isRealPdf(filePath) {
  let handle;
  try {
    handle = await fs.promises.open(filePath, 'r');
    const buffer = Buffer.alloc(PDF_SIGNATURE.length);
    const { bytesRead } = await handle.read(buffer, 0, PDF_SIGNATURE.length, 0);
    return bytesRead === PDF_SIGNATURE.length && buffer.equals(PDF_SIGNATURE);
  } catch {
    return false;
  } finally {
    await handle?.close();
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Fast first pass only: at this point multer has just the client-supplied
    // mimetype label, not the file's bytes yet, and that label is trivially
    // spoofable. This just rejects the obviously-wrong case early, before
    // anything is written to disk; isRealPdf() below is the real check,
    // against the file's actual content once it exists on disk.
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
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: `File is too large - max ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }

    // The mimetype-based fileFilter above only checked a client-supplied
    // label. Now that the file actually exists on disk, confirm it's a
    // genuine PDF before letting the request through to the controller
    // (and from there, to Cloudinary).
    if (req.file && !(await isRealPdf(req.file.path))) {
      fs.unlink(req.file.path, () => {}); // best-effort cleanup - nothing else removes this file on this path
      return res.status(400).json({ message: 'Only genuine PDF files are allowed' });
    }

    return next();
  });
};

module.exports = { upload, uploadSingle };
