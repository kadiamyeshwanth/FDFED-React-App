const jwt = require('jsonwebtoken');

const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Admin123!',
  passKey: 'secret123'
};

// Middleware to protect admin routes
module.exports = function authAdmin(req, res, next) {
  try {
    const { email, password, passKey } = req.body;

    // Option 1: Check credentials in login route
    if (req.path === '/admin/login') {
      if (
        email === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password &&
        passKey === ADMIN_CREDENTIALS.passKey
      ) {
        // Generate a temporary token for admin
        const token = jwt.sign({ role: 'admin' }, 'your_jwt_secret', {
          expiresIn: '1h',
        });
        return res.json({ message: 'Admin authenticated', token });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    // Option 2: Verify token for other protected routes
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

    const verified = jwt.verify(token, 'your_jwt_secret');
    if (verified.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden: Not an admin' });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
