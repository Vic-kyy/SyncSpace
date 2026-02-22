// ──────────────────────────────────────────────
// Auth Middleware — Hybrid Mode
// Supports both JWT token auth AND temp-user header
// Phase 4 will remove the temp-user fallback
// ──────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check for Bearer token (real auth)
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return res.status(401).json({ message: 'User no longer exists' });
            }
            req.user = currentUser;
            req.user.role = req.user.role || 'MEMBER';
            return next();
        }

        // 2. Fallback: temp user ID header (pre-Phase 4 compatibility)
        const tempUserId = req.headers['x-user-id'];
        if (tempUserId) {
            const found = await User.findById(tempUserId).catch(() => null);
            if (found) {
                req.user = found;
                req.user.role = req.user.role || 'MEMBER';
                return next();
            }
        }

        // 3. No auth at all — 401
        return res.status(401).json({ message: 'Not authenticated. Please login or signup.' });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('[Auth] Error:', error.message);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
