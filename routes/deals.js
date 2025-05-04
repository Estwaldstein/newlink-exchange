const express = require('express');
const router = express.Router();
const Deal = require('../models/deals');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth'); // assuming you have this
const fs = require('fs');

// Set up multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only documents are allowed'));
    }
  }
});

// Submit a deal
router.post('/submit', authMiddleware, upload.single('documents'), async (req, res) => {
  try {
    const { title, description, sector, currency, value, country } = req.body;

    const documentPaths = req.file ? [req.file.path] : [];

    const deal = new Deal({
      title,
      description,
      sector,
      currency: currency || undefined,
      value: value ? Number(value) : undefined,
      country: country || undefined,
      documents: documentPaths,
      submittedBy: req.user.id
    });

    await deal.save();
    res.status(201).json({ message: 'Deal submitted successfully.' });
  } catch (err) {
    console.error('❌ Error submitting deal:', err);
    res.status(500).json({ error: 'Failed to submit deal.' });
  }
});

// List all deals (example endpoint)
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const deals = await Deal.find({ submittedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    console.error('❌ Error fetching deals:', err);
    res.status(500).json({ error: 'Failed to fetch deals.' });
  }
});

module.exports = router;
