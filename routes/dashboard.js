const express = require('express');
const auth = require('../middleware/authMiddleware');
const Deal = require('../models/Deal');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { role, id } = req.user;

  if (role === 'introducer') {
    const deals = await Deal.find({ submittedBy: id });
    return res.json({ dashboard: 'introducer', deals });
  }

  if (role === 'partner') {
    const deals = await Deal.find();
    return res.json({ dashboard: 'partner', deals });
  }

  if (role === 'admin') {
    const deals = await Deal.find();
    return res.json({ dashboard: 'admin', deals });
  }

  res.status(403).json({ error: 'Unauthorized' });
});

module.exports = router;