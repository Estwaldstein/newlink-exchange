const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['introducer', 'partner', 'admin'], default: 'introducer' },
  notifications: [NotificationSchema]
});

module.exports = mongoose.model('User', userSchema);
