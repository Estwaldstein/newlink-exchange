const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: String,
  description: String,
  sector: { type: String, enum: ['private_equity', 'wealth_management', 'real_estate'] },
  documents: [String], // paths to uploaded docs
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ndaSignedByIntroducer: { type: Boolean, default: false },
  ndaSignedByPartner: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);