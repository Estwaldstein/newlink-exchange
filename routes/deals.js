const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Deal = require('../models/Deal');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Configure multer to preserve original filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const upload = multer({ storage });

// Submit a deal (Introducer only)
router.post('/submit', auth, upload.array('documents'), async (req, res) => {
  if (req.user.role !== 'introducer') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, sector, currency, value, country } = req.body;
  const documents = req.files.map(f => f.filename);

  const deal = new Deal({
    title,
    description,
    sector,
    currency,
    value: value ? Number(value) : undefined,
    country,
    documents,
    submittedBy: req.user.id
  });

  await deal.save();
  res.status(201).json({ message: 'Deal submitted', deal });
});

// View deals
router.get('/list', auth, async (req, res) => {
  if (req.user.role === 'admin') {
    const deals = await Deal.find().populate('submittedBy', 'email').sort({ createdAt: -1 });
    return res.json(deals);
  }

  if (req.user.role === 'partner') {
    const deals = await Deal.find({ status: 'approved' }).sort({ createdAt: -1 });
    return res.json(deals);
  }

  return res.status(403).json({ error: 'Unauthorized' });
});

// NDA agreement
router.post('/nda/:id', auth, async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  if (req.user.role === 'introducer') {
    deal.ndaSignedByIntroducer = true;
  } else if (req.user.role === 'partner') {
    deal.ndaSignedByPartner = true;
  } else {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await deal.save();
  res.json({ message: 'NDA signed' });
});

// Express interest
router.post('/interest/:id', auth, async (req, res) => {
  if (req.user.role !== 'partner') {
    return res.status(403).json({ error: 'Only partners can express interest' });
  }

  const deal = await Deal.findById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  if (!deal.interestedPartners.includes(req.user.id)) {
    deal.interestedPartners.push(req.user.id);
    await deal.save();

    try {
      const introducer = await User.findById(deal.submittedBy.toString());
      if (introducer) {
        introducer.notifications.push({
          content: `A partner has shown interest in your deal: "${deal.title}"`
        });
        await introducer.save();
      }
    } catch (err) {
      console.error('Error notifying introducer:', err);
    }
  }

  res.json({ message: 'Interest expressed', dealId: deal._id });
});

// Admin: Update status
router.post('/status/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update status' });
  }

  const { status } = req.body;
  if (!['pending', 'approved', 'archived', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const deal = await Deal.findById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  deal.status = status;
  await deal.save();

  res.json({ message: 'Status updated', deal });
});

module.exports = router;
