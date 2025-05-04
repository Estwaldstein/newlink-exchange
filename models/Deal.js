const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sector: {
    type: String,
    enum: ['private_equity', 'wealth_management', 'real_estate'],
    required: true
  },
  documents: [String], // paths to uploaded docs
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ndaSignedByIntroducer: { type: Boolean, default: false },
  ndaSignedByPartner: { type: Boolean, default: false },
  interestedPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'archived', 'rejected'],
    default: 'pending'
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'CNY', 'INR'],
    default: undefined
  },
  value: {
    type: Number,
    min: 0,
    default: undefined
  },
  country: {
    type: String,
    default: undefined
  }
}, { timestamps: true });

module.exports = mongoose.models.Deal || mongoose.model('Deal', dealSchema);
