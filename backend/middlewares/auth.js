const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized. Please login.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
};