import express from 'express';
import authRoutes from './authRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import webhookRoutes from './webhookRoutes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhook', webhookRoutes);

export default router;