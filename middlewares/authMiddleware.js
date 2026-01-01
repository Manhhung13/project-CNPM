const jwt = require('jsonwebtoken');

// Middleware xác thực: bắt buộc có token hợp lệ
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : null;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded: { id, username, role, iat, exp }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware phân quyền theo role
const requireRole = (roles = []) => {
    // Cho phép truyền 1 string hoặc mảng
    if (!Array.isArray(roles)) roles = [roles];

    return (req, res, next) => {
        // authMiddleware phải chạy trước để có req.user
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.length || roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({ message: 'Forbidden: insufficient role' });
    };
};

module.exports = {
    authMiddleware,
    requireRole,
};
