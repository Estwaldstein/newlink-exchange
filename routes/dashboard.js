const express = require('express');
const auth = require('../middleware/authMiddleware');
const Deal = require('../models/Deal');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { role, id } = req.user;

  let deals = [];

  if (role === 'introducer') {
    deals = await Deal.find({ submittedBy: id });
  } else if (role === 'partner') {
    deals = await Deal.find();
    // Hide documents unless NDA is signed by both sides
    deals = deals.map(deal => {
      const dealObj = deal.toObject();
      const ndaSigned = dealObj.ndaSignedByPartner && dealObj.ndaSignedByIntroducer;

      if (!ndaSigned) {
        dealObj.documents = []; // Hide file paths
      }

      return dealObj;
    });
    
  } else if (role === 'admin') {
  const { status } = req.query;

  const query = {};
  if (status && ['pending', 'approved', 'archived'].includes(status)) {
    query.status = status;
  }

  deals = await Deal.find(query)
    .populate('submittedBy', 'email role')
    .populate('interestedPartners', 'email role');
  }
    else {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({ dashboard: role, deals });
});

module.exports = router;
