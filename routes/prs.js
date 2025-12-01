const express = require('express');
const router = express.Router();
const PR = require('../models/PersonalRecord');

// list prs for user
router.get('/:userId', async (req, res) => {
  try {
    const prs = await PR.find({ user_id: req.params.userId });
    res.json(prs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// single PR
router.get('/:userId/:exerciseId', async (req, res) => {
  try {
    const pr = await PR.findOne({ user_id: req.params.userId, exercise_id: req.params.exerciseId });
    if (!pr) return res.status(404).json({ error: 'not found' });
    res.json(pr);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
