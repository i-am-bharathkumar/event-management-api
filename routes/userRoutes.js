const express = require('express');
const router = express.Router();
const { getEventCountForUser } = require('../models/userModel');

router.get('/:id/events/count', async (req, res) => {
  const userId = req.params.id;

  try {
    const count = await getEventCountForUser(userId);
    res.json({ userId, eventCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching event count' });
  }
});

module.exports = router;
