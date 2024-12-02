const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  sourceUrl: { type: String, required: true },
  callbackUrl: { type: String, required: true },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Webhook', webhookSchema);
