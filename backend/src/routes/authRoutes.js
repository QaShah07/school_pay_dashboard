import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegistration, validateLogin } from '../middleware/validators.js';

const router = express.Router();

// Route: POST /api/auth/register
router.post('/register', validateRegistration, registerUser);

// Route: POST /api/auth/login
router.post('/login', validateLogin, loginUser);

// Route: GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

export default router;