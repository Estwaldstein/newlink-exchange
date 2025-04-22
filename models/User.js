const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['introducer', 'partner', 'admin'], default: 'introducer' }

notifications: [{
  content: String,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}]
});

module.exports = mongoose.model('User', userSchema);
