import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import OrderStatus from '../models/OrderStatus.js';
import WebhookLog from '../models/WebhookLog.js';

/**
 * Handle payment gateway webhook
 * @route POST /api/webhook
 * @access Public
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const webhookData = req.body;
  
  // Log the webhook payload
  const webhookLog = await WebhookLog.create({
    payload: webhookData,
    timestamp: new Date()
  });
  
  try {
    // Extract data from webhook payload
    const { status, order_info } = webhookData;
    
    if (status !== 200 || !order_info) {
      throw new Error('Invalid webhook payload');
    }
    
    const {
      order_id,
      order_amount,
      transaction_amount,
      gateway,
      bank_reference,
      status: paymentStatus,
      payment_mode,
      payment_details,
      payment_message,
      payment_time,
      error_message
    } = order_info;
    
    // Find the order by ID (which is our custom_order_id)
    const order = await Order.findOne({ custom_order_id: order_id });
    
    if (!order) {
      throw new Error(`Order not found for ID: ${order_id}`);
    }
    
    // Update or create the order status
    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id },
      {
        order_amount,
        transaction_amount,
        payment_mode,
        payment_details,
        bank_reference,
        payment_message,
        status: paymentStatus.toLowerCase(),
        error_message: error_message || 'NA',
        payment_time: new Date(payment_time)
      },
      { new: true, upsert: true }
    );
    
    // Mark webhook as processed
    await WebhookLog.findByIdAndUpdate(webhookLog._id, { processed: true });
    
    // Send success response
    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Update webhook log with error
    await WebhookLog.findByIdAndUpdate(webhookLog._id, { 
      error: error.message,
      processed: false
    });
    
    // Still return 200 to avoid retries from payment gateway
    res.status(200).json({ 
      success: false, 
      message: 'Webhook received but failed to process',
      error: error.message
    });
  }
});