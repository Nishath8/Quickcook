const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No authentication token found. Please log in.' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'any_long_random_string_here_like_quickcook_jks91';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains { userId, email }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid or has expired. Please log in again.' });
  }
};

module.exports = authMiddleware;
