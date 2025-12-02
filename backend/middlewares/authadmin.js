const jwt = require('jsonwebtoken');
const { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSKEY } = require('../config/constants');

// Middleware to protect admin routes
module.exports = function authAdmin(req, res, next) {
  try {
    // Special handling for login route - verify credentials
    if (req.path === '/admin/login' || req.url === '/admin/login') {
      const { email, password, passKey } = req.body;
      
      if (
        email === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD &&
        passKey === ADMIN_PASSKEY
      ) {
        // Generate JWT token for admin
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
          expiresIn: '1h',
        });
        // Set httpOnly cookie for security
        res.cookie('admin_token', token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false, // Set to true in production with HTTPS
          maxAge: 60 * 60 * 1000, // 1 hour
          path: '/',
        });
        return res.json({ message: 'Admin authenticated', token });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    // For all other routes - verify token
    // Accept token from Authorization header or cookie `admin_token`
    const headerToken = req.header('Authorization')?.replace('Bearer ', '');
    const cookieToken = req.cookies?.admin_token;
    const token = headerToken || cookieToken;
    
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (verified.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Not an admin' });
    }

    // Token is valid, proceed to next middleware/route
    req.admin = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
