const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');

// File upload setup
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  }
});

// Submit a new deal
router.post('/submit', authMiddleware, upload.single('documents'), async (req, res) => {
  try {
    const { title, description, sector, currency, value, country } = req.body;

    const documentPaths = req.file ? [req.file.path] : [];

    const deal = new Deal({
      title,
      description,
      sector,
      submittedBy: req.user.id,
      currency: currency || undefined,
      value: value ? Number(value) : undefined,
      country: country || undefined,
      documents: documentPaths
    });

    await deal.save();
    res.status(201).json({ message: 'Deal submitted successfully' });
  } catch (error) {
    console.error('❌ Deal submission error:', error);
    res.status(500).json({ error: 'Failed to submit deal' });
  }
});

// Get list of deals submitted by current user
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const deals = await Deal.find({ submittedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(deals);
  } catch (error) {
    console.error('❌ Fetching deals error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

module.exports = router;
