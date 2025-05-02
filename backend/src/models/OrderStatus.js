import mongoose from 'mongoose';

const orderStatusSchema = new mongoose.Schema({
  collect_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  order_amount: {
    type: Number,
    required: true
  },
  transaction_amount: {
    type: Number,
    required: true
  },
  payment_mode: {
    type: String,
    required: true
  },
  payment_details: {
    type: String,
    required: true
  },
  bank_reference: {
    type: String,
    required: true
  },
  payment_message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
    index: true
  },
  error_message: {
    type: String,
    default: 'NA'
  },
  payment_time: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
orderStatusSchema.index({ collect_id: 1 });
orderStatusSchema.index({ status: 1 });
orderStatusSchema.index({ payment_time: 1 });

const OrderStatus = mongoose.model('OrderStatus', orderStatusSchema);

export default OrderStatus;