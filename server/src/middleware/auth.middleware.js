const jwt = require('jsonwebtoken');

// Confirms the request carries a valid, unexpired session cookie.
// On success, attaches the decoded token payload ({ _id, role }) to req.user.
exports.verifyToken = (req, res, next) => {
    const token = req.cookies && req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Please log in to continue' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Session expired, please log in again' });
    }
};

// Must run after verifyToken. Only lets admin-role sessions through.
exports.requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
