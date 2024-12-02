const axios = require('axios');

const retryWebhook = async (webhook) => {
  try {
    await axios.post(webhook.callbackUrl, { message: 'Retrying' });
    console.log('Retrying webhook delivery', webhook._id);
  } catch (error) {
    console.log('Failed to retry webhook', webhook._id);
  }
};

module.exports = { retryWebhook };
