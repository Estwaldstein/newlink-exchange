const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// Send a message (POST /api/messages/:dealId)
router.post('/:dealId', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = new Message({
      deal: req.params.dealId,
      sender: req.user.id,
      content
    });

    await message.save();
    res.status(201).json({ message: 'Message sent', data: message });

  } catch (err) {
    console.error('Message send error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a deal (GET /api/messages/:dealId)
router.get('/:dealId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ deal: req.params.dealId })
      .sort('timestamp')
      .populate('sender', 'email role');

    res.json(messages);
  } catch (err) {
    console.error('Message fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
