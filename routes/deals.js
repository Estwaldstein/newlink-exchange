const express = require('express');
const multer = require('multer');
const Deal = require('../models/Deal');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Submit a deal
router.post('/submit', auth, upload.array('documents'), async (req, res) => {
  if (req.user.role !== 'introducer') return res.status(403).json({ error: 'Unauthorized' });

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

// View deals (for partner)
router.get('/list', auth, async (req, res) => {
  if (req.user.role !== 'partner') return res.status(403).json({ error: 'Unauthorized' });

  const deals = await Deal.find();
  res.json(deals);
});

// NDA agreement (introducer or partner)
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

module.exports = router;