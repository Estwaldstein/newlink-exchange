const express = require('express');
const multer = require('multer');
const Deal = require('../models/Deal');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Submit a deal (Introducer only)
router.post('/submit', auth, upload.array('documents'), async (req, res) => {
  if (req.user.role !== 'introducer') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, sector } = req.body;
  const documents = req.files.map(f => f.path);

  const deal = new Deal({
    title,
    description,
    sector,
    documents,
    submittedBy: req.user.id
  });

  await deal.save();
  res.status(201).json({ message: 'Deal submitted', deal });
});

// View all deals (Partner only)
router.get('/list', auth, async (req, res) => {
  if (req.user.role !== 'partner') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const deals = await Deal.find();
  res.json(deals);
});

// NDA agreement (Introducer or Partner)
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

// Express interest in a deal (Partner only)
router.post('/interest/:id', auth, async (req, res) => {
  if (req.user.role !== 'partner') {
    return res.status(403).json({ error: 'Only partners can express interest' });
  }

  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }

  if (!deal.interestedPartners.includes(req.user.id)) {
    deal.interestedPartners.push(req.user.id);
    await deal.save();
  }

  res.json({ message: 'Interest expressed', dealId: deal._id });
});

module.exports = router;
