const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: String,
  description: String,
  sector: { type: String, enum: ['private_equity', 'wealth_management', 'real_estate'] },
  documents: [String], // paths to uploaded docs
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ndaSignedByIntroducer: { type: Boolean, default: false },
  ndaSignedByPartner: { type: Boolean, default: false },
  interestedPartners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'approved', 'archived', 'rejected'], default: 'pending' },
  currency: { type: String, default: null },
  value: { type: Number, default: null },
  country: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Deal || mongoose.model('Deal', dealSchema);
