import express from 'express';
import { createPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validatePaymentCreation } from '../middleware/validators.js';

const router = express.Router();

// Route: POST /api/payments/create
router.post('/create', protect, validatePaymentCreation, createPayment);

export default router;