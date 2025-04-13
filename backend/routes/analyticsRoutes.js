import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getLinkAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Protected routes
router.get('/:id', protect, getLinkAnalytics);

export default router;