const express = require('express');
const router = express.Router();
const { subscribe, listSubscriptions, cancelSubscription, handleEvent, getRecentEventsForSubscribedWebhooks, getRecentEventsForWebhook } = require('../controllers/webhook.controller');
const authenticateJWT = require('../middleware/auth.middleware');

router.post('/subscribe', authenticateJWT, subscribe);
router.get('/subscriptions', authenticateJWT, listSubscriptions);
router.delete('/cancel-subscription/:id', authenticateJWT, cancelSubscription);
router.post('/webhook-event', handleEvent);
router.get('/recent-events', authenticateJWT, getRecentEventsForSubscribedWebhooks);
router.get('/recent-events/:id', authenticateJWT, getRecentEventsForWebhook);

module.exports = router;
