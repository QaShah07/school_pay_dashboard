import express from 'express';
import { 
  getTransactions, 
  getSchoolTransactions, 
  getTransactionStatus 
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: GET /api/transactions
router.get('/', protect, getTransactions);

// Route: GET /api/transactions/school/:schoolId
router.get('/school/:schoolId', protect, getSchoolTransactions);

// Route: GET /api/transactions/status/:customOrderId
router.get('/status/:customOrderId', protect, getTransactionStatus);

export default router;