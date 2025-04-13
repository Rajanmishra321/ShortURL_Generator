import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Not authorized');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error('User not found');

    req.user = await User.findById(decoded.userId).select('-password'); 
    next();
  } catch (error) {
    res.status(401).json({ 
      message: error.message.includes('jwt') ? 'Invalid token' : error.message 
    });
  }
};