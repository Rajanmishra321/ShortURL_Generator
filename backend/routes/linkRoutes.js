import express from 'express';
import { createShortLink, redirect } from '../controllers/linkController.js';
import { protect } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Protected route
router.post('/', protect, createShortLink);

// Public redirect
router.get('/:shortCode', redirect);

export default router;