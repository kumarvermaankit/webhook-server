const Webhook = require('../models/webhook.model');
const axios = require('axios');
const { retryWebhook } = require('../utils/retryWebhook');
const WebhookEvent = require('../models/webhookEvent.model');

const subscribe = async (req, res) => {
    const { sourceUrl, callbackUrl } = req.body;
    const userId = req.user.id;
  
    try {
      const existingWebhook = await Webhook.findOne({ sourceUrl, callbackUrl });
  
      if (existingWebhook) {
        return res.status(400).json({ message: 'Webhook with the same sourceUrl and callbackUrl already exists' });
      }
  
      const newWebhook = new Webhook({ userId, sourceUrl, callbackUrl });
      await newWebhook.save();
      res.status(200).json(newWebhook);
    } catch (error) {
      res.status(500).json({ message: 'Error subscribing to webhook' });
    }
  };
  

const listSubscriptions = async (req, res) => {
  const userId = req.user.id;

  try {
    const subscriptions = await Webhook.find({ userId });
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
};

const cancelSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Webhook.findByIdAndUpdate(id, { status: 'inactive' });
    if (!result) return res.status(404).json({ message: 'Webhook not found' });
    res.status(200).json({ message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
};

const handleEvent = async (req, res) => {
    const event = req.body;
    try {
      const webhooks = await Webhook.find({ status: 'active', sourceUrl: event.source });
  
      if (webhooks.length === 0) {
        return res.status(404).json({ message: 'No active webhooks found' });
      }
  
      for (const webhook of webhooks) {
        try {
          const newEvent = new WebhookEvent({
            webhookId: webhook._id,
            type: event.eventType,
            data: event.data,
          });
  
          await newEvent.save();
        } catch (error) {
          console.error(`Error sending event to webhook ${webhook._id}`, error);
        }
      }
  
      res.status(200).json({ message: 'Event processed successfully' });
  
    } catch (error) {
      console.error('Error processing event', error);
      res.status(500).json({ message: 'Error processing event' });
    }
  };
  


const getRecentEventsForSubscribedWebhooks = async (req, res) => {
  try {
    const userId = req.user.id;
    const webhooks = await Webhook.find({ userId, status: 'active' });

    if (webhooks.length === 0) {
      return res.status(404).json({ message: 'No active webhooks found for this user' });
    }

    const events = await Promise.all(
      webhooks.map(async (webhook) => {
        const recentEvent = await WebhookEvent.find({ webhookId: webhook._id })
          .sort({ timestamp: -1 });
        return {
          webhookId: webhook._id,
          sourceUrl: webhook.sourceUrl,
          callbackUrl: webhook.callbackUrl,
          recentEvent: recentEvent ? recentEvent : null,
        };
      })
    );

    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching recent events:', error);
    res.status(500).json({ message: 'Error fetching recent events for webhooks' });
  }
};

const getRecentEventsForWebhook = async (req, res) => {
    try {
      const { id: webhookId } = req.params;
      const webhook = await Webhook.findById(webhookId);
  
      if (!webhook) {
        return res.status(404).json({ message: 'Webhook not found' });
      }
  
      const recentEvents = await WebhookEvent.find({ webhookId: webhook._id })
        .sort({ timestamp: -1 })
        .limit(10);
  
      return res.status(200).json({
        webhookId: webhook._id,
        sourceUrl: webhook.sourceUrl,
        callbackUrl: webhook.callbackUrl,
        recentEvents: recentEvents.length > 0 ? recentEvents : null,
      });
    } catch (error) {
      console.error('Error fetching recent events for webhook:', error);
      res.status(500).json({ message: 'Error fetching recent events for webhook' });
    }
  };
  

module.exports = { subscribe, listSubscriptions, cancelSubscription, handleEvent, getRecentEventsForSubscribedWebhooks, getRecentEventsForWebhook };
