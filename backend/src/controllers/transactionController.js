import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import OrderStatus from '../models/OrderStatus.js';
import mongoose from 'mongoose';

/**
 * Get all transactions with pagination and sorting
 * @route GET /api/transactions
 * @access Private
 */
export const getTransactions = asyncHandler(async (req, res) => {
  // Extract query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortField = req.query.sort || 'payment_time';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;
  const status = req.query.status || null;
  const startDate = req.query.startDate || null;
  const endDate = req.query.endDate || null;
  
  // Build match conditions for filtering
  const matchConditions = {};
  
  if (status) {
    matchConditions['orderStatus.status'] = status;
  }
  
  if (startDate && endDate) {
    matchConditions['orderStatus.payment_time'] = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  // Aggregation pipeline
  const pipeline = [
    {
      $lookup: {
        from: 'orderstatuses',
        localField: '_id',
        foreignField: 'collect_id',
        as: 'orderStatus'
      }
    },
    { $unwind: '$orderStatus' },
    { $match: matchConditions },
    {
      $project: {
        collect_id: '$_id',
        school_id: 1,
        gateway: '$gateway_name',
        order_amount: '$orderStatus.order_amount',
        transaction_amount: '$orderStatus.transaction_amount',
        status: '$orderStatus.status',
        custom_order_id: 1,
        payment_time: '$orderStatus.payment_time'
      }
    },
    { $sort: { [sortField]: sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  ];
  
  // Execute the aggregation
  const transactions = await Order.aggregate(pipeline);
  
  // Count total documents for pagination
  const countPipeline = [
    {
      $lookup: {
        from: 'orderstatuses',
        localField: '_id',
        foreignField: 'collect_id',
        as: 'orderStatus'
      }
    },
    { $unwind: '$orderStatus' },
    { $match: matchConditions },
    { $count: 'total' }
  ];
  
  const totalDocuments = await Order.aggregate(countPipeline);
  const total = totalDocuments.length > 0 ? totalDocuments[0].total : 0;
  
  res.status(200).json({
    success: true,
    count: transactions.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    transactions
  });
});

/**
 * Get all transactions for a specific school
 * @route GET /api/transactions/school/:schoolId
 * @access Private
 */
export const getSchoolTransactions = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  
  // Extract query parameters for pagination and sorting
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortField = req.query.sort || 'payment_time';
  const sortOrder = req.query.order === 'asc' ? 1 : -1;
  
  // Aggregation pipeline
  const pipeline = [
    { $match: { school_id: schoolId } },
    {
      $lookup: {
        from: 'orderstatuses',
        localField: '_id',
        foreignField: 'collect_id',
        as: 'orderStatus'
      }
    },
    { $unwind: '$orderStatus' },
    {
      $project: {
        collect_id: '$_id',
        school_id: 1,
        gateway: '$gateway_name',
        order_amount: '$orderStatus.order_amount',
        transaction_amount: '$orderStatus.transaction_amount',
        status: '$orderStatus.status',
        custom_order_id: 1,
        payment_time: '$orderStatus.payment_time'
      }
    },
    { $sort: { [sortField]: sortOrder } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  ];
  
  // Execute the aggregation
  const transactions = await Order.aggregate(pipeline);
  
  // Count total documents for pagination
  const totalDocuments = await Order.countDocuments({ school_id: schoolId });
  
  res.status(200).json({
    success: true,
    count: transactions.length,
    totalPages: Math.ceil(totalDocuments / limit),
    currentPage: page,
    transactions
  });
});

/**
 * Get status of a specific transaction by custom order ID
 * @route GET /api/transactions/status/:customOrderId
 * @access Private
 */
export const getTransactionStatus = asyncHandler(async (req, res) => {
  const { customOrderId } = req.params;
  
  // Find the order by custom order ID
  const order = await Order.findOne({ custom_order_id: customOrderId });
  
  if (!order) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  // Find the order status
  const orderStatus = await OrderStatus.findOne({ collect_id: order._id });
  
  if (!orderStatus) {
    res.status(404);
    throw new Error('Transaction status not found');
  }
  
  // Return the transaction status
  res.status(200).json({
    success: true,
    transaction: {
      collect_id: order._id,
      custom_order_id: order.custom_order_id,
      school_id: order.school_id,
      gateway: order.gateway_name,
      order_amount: orderStatus.order_amount,
      transaction_amount: orderStatus.transaction_amount,
      status: orderStatus.status,
      payment_mode: orderStatus.payment_mode,
      payment_message: orderStatus.payment_message,
      payment_time: orderStatus.payment_time
    }
  });
});