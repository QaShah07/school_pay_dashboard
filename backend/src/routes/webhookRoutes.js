import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Route: POST /api/webhook
router.post('/', handleWebhook);

export default router;