const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const PR = require('../models/PersonalRecord');
const mongoose = require('mongoose');

// create workout and update PRs
router.post('/', async (req, res) => {
  try {
    // Mongoose will automatically convert string user_id to ObjectId based on schema
    const w = await Workout.create(req.body);

    // iterate exercises and sets, update PRs when set.weight > current PR
    for (const ex of w.exercises || []) {
      if (!ex.exercise_id) continue;
      for (const set of ex.sets || []) {
        if (!set || typeof set.weight !== 'number') continue;
        // use upsert style: find existing PR
        const filter = { user_id: w.user_id, exercise_id: ex.exercise_id };
        const existing = await PR.findOne(filter);
        if (!existing) {
          await PR.create({ user_id: w.user_id, exercise_id: ex.exercise_id, best_weight: set.weight, date_set: w.date });
        } else if (set.weight > existing.best_weight) {
          existing.best_weight = set.weight;
          existing.date_set = w.date;
          await existing.save();
        }
      }
    }

    res.status(201).json(w);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// list workouts for a user
router.get('/:userId', async (req, res) => {
  try {
    const workouts = await Workout.find({ user_id: req.params.userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get single workout
router.get('/byid/:id', async (req, res) => {
  try {
    const w = await Workout.findById(req.params.id);
    if (!w) return res.status(404).json({ error: 'not found' });
    res.json(w);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// delete workout (using byid to avoid conflict with /:userId route)
router.delete('/byid/:id', async (req, res) => {
  try {
    const w = await Workout.findByIdAndDelete(req.params.id);
    if (!w) return res.status(404).json({ error: 'not found' });
    res.json({ message: 'Workout deleted successfully', workout: w });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
