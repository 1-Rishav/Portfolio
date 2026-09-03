const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Confirms the request carries a valid, unexpired session cookie, AND that
// the account it names still exists with the role it claims. The JWT's own
// payload only reflects the account's state at the moment it was issued -
// up to a year ago, per generateAuthToken's "1y" expiresIn - so without this
// lookup, a deleted account or one demoted from admin would keep working
// under its old token until that token happened to naturally expire.
// On success, attaches the account's CURRENT { _id, role } to req.user.
exports.verifyToken = async (req, res, next) => {
    const token = req.cookies && req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Please log in to continue' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: 'Session expired, please log in again' });
    }

    try {
        const user = await User.findById(decoded._id).select('_id role').lean();
        if (!user) {
            // Signature/expiry were fine, but the account is gone - same
            // user-facing outcome as an expired token: log in again.
            return res.status(401).json({ message: 'Session expired, please log in again' });
        }
        req.user = { _id: user._id, role: user.role };
        next();
    } catch {
        // A genuine DB error is a different problem than an expired session,
        // so it gets its own message rather than reusing the one above.
        return res.status(500).json({ message: 'Something went wrong, please try again' });
    }
};

// Must run after verifyToken. Only lets admin-role sessions through.
exports.requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
