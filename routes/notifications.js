const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get current user's notifications
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.notifications || []);
});

// Mark all as read (optional future feature)
router.post('/read-all', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.notifications = user.notifications.map(n => ({ ...n.toObject(), read: true }));
  await user.save();
  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
