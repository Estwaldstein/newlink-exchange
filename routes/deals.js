const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Deal = require('../models/Deal');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Configure multer to preserve original filenames and allow only PDFs
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

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

/**
 * Submit a new deal (Introducer only)
 */
router.post('/submit', auth, (req, res, next) => {
  upload.array('documents')(req, res, async (err) => {
    if (err instanceof multer.MulterError || err?.message === 'Only PDF files are allowed') {
      return res.status(400).json({ error: err.message || 'Upload error' });
    }
    if (req.user.role !== 'introducer') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
      const { title, description, sector, currency, value, country } = req.body;
      const documents = req.files?.map(f => f.filename) || [];

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
    } catch (err) {
      console.error('❌ Error submitting deal:', err);
      res.status(500).json({ error: 'Server error submitting deal' });
    }
  });
});

/**
 * Get deals by role
 */
router.get('/list', auth, async (req, res) => {
  try {
    let deals;

    if (req.user.role === 'admin') {
      deals = await Deal.find()
        .populate('submittedBy', 'email')
        .populate('interestedPartners', 'email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'partner') {
      deals = await Deal.find({ status: 'approved' })
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'introducer') {
      deals = await Deal.find({ submittedBy: req.user.id })
        .populate('interestedPartners', 'email')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(deals);
  } catch (err) {
    console.error('❌ Error retrieving deals:', err);
    res.status(500).json({ error: 'Server error retrieving deals' });
  }
});

/**
 * Sign NDA for a deal
 */
router.post('/nda/:id', auth, async (req, res) => {
  try {
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
  } catch (err) {
    console.error('❌ Error signing NDA:', err);
    res.status(500).json({ error: 'Server error signing NDA' });
  }
});

/**
 * Express interest in a deal (Partner only)
 */
router.post('/interest/:id', auth, async (req, res) => {
  if (req.user.role !== 'partner') {
    return res.status(403).json({ error: 'Only partners can express interest' });
  }

  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    if (!deal.interestedPartners.includes(req.user.id)) {
      deal.interestedPartners.push(req.user.id);
      await deal.save();

      const introducer = await User.findById(deal.submittedBy.toString());
      const partner = await User.findById(req.user.id);

      if (introducer && partner) {
        introducer.notifications.push({
          content: `${partner.email} has shown interest in your deal: "${deal.title}"`
        });
        await introducer.save();
      }
    }

    res.json({ message: 'Interest expressed', dealId: deal._id });
  } catch (err) {
    console.error('❌ Error expressing interest:', err);
    res.status(500).json({ error: 'Server error expressing interest' });
  }
});

/**
 * Update deal status (Admin only)
 */
router.post('/status/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update status' });
  }

  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'archived', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });

    deal.status = status;
    await deal.save();

    res.json({ message: 'Status updated', deal });
  } catch (err) {
    console.error('❌ Error updating deal status:', err);
    res.status(500).json({ error: 'Server error updating status' });
  }
});

module.exports = router;
