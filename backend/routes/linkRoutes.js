import express from 'express';
import { createShortLink, redirect } from '../controllers/linkController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { getLinks } from '../controllers/linkController.js';


const router = express.Router();

// Protected route
router.post('/', protect, createShortLink);
router.get('/', protect, getLinks); // Add this endpoint

// Public redirect
router.get('/:shortCode', redirect);

export default router;