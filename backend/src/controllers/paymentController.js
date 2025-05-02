import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import OrderStatus from '../models/OrderStatus.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';

/**
 * Create a new payment request
 * @route POST /api/payments/create
 * @access Private
 */
export const createPayment = asyncHandler(async (req, res) => {
  const { 
    school_id, 
    trustee_id, 
    student_info, 
    amount, 
    gateway_name 
  } = req.body;
  
  // Generate a unique custom_order_id
  const custom_order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Create an order in our database
  const order = await Order.create({
    school_id,
    trustee_id,
    student_info,
    gateway_name,
    custom_order_id
  });
  
  // Create initial order status
  await OrderStatus.create({
    collect_id: order._id,
    order_amount: amount,
    transaction_amount: amount,
    payment_mode: 'pending',
    payment_details: 'pending',
    bank_reference: 'pending',
    payment_message: 'Payment initiated',
    status: 'pending'
  });
  
  // Prepare payload for payment gateway
  const payload = {
    pg_key: process.env.PG_KEY,
    school_id: process.env.SCHOOL_ID,
    custom_order_id,
    order_amount: amount,
    student_info,
    redirect_url: `${req.get('origin') || 'http://localhost:3000'}/payment/status/${custom_order_id}`
  };
  
  // Sign payload with JWT
  const signedPayload = jwt.sign(payload, process.env.API_KEY, { 
    expiresIn: '1h'
  });
  
  try {
    // Call payment gateway API
    const response = await axios.post(
      `${process.env.PG_API_URL}/create-collect-request`,
      { ...payload, signed_payload: signedPayload },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      }
    );
    
    // Return the payment page URL from the gateway response
    res.status(200).json({
      success: true,
      payment_url: response.data.payment_url,
      custom_order_id
    });
    
  } catch (error) {
    console.error('Payment gateway error:', error.response?.data || error.message);
    res.status(500);
    
    // Update order status to failed
    await OrderStatus.findOneAndUpdate(
      { collect_id: order._id },
      { 
        status: 'failed',
        error_message: error.response?.data?.message || error.message
      }
    );
    
    throw new Error('Failed to create payment. Please try again.');
  }
});