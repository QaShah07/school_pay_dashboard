import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema({
  payload: {
    type: Object,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);

export default WebhookLog;