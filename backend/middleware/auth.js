const jwt = require('jsonwebtoken');
const AuthModel = require('../modules/auth/authModel');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'Token verification failed' });
    }
  }
};


module.exports = { authenticateToken };
