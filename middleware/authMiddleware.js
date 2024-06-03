const jwt = require('jsonwebtoken');

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded; // Attach decoded user info to request object
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticateUser;
