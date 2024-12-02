const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  webhookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webhook' },
  type: { type: String, required: true },
  data: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now },
});

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

module.exports = WebhookEvent;
