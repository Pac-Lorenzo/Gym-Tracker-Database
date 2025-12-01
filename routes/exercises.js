const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const User = require('../models/User');

// Get all global exercises
router.get('/', async (req, res) => {
  try {
    const ex = await Exercise.find({}).sort({ name: 1 });
    res.json(ex);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get combined library (global + user custom exercises)
router.get('/library/:userId', async (req, res) => {
  try {
    const globalExercises = await Exercise.find({}).sort({ name: 1 });
    const user = await User.findById(req.params.userId);
    const userCustomExercises = user ? user.custom_exercises || [] : [];
    
    res.json({
      global: globalExercises,
      custom: userCustomExercises,
      combined: [...globalExercises.map(ex => ({ ...ex.toObject(), is_custom: false, source: 'global' })), 
                 ...userCustomExercises.map(ex => ({ ...ex, is_custom: true, source: 'user' }))]
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add exercise to global library
router.post('/', async (req, res) => {
  try {
    // Generate exercise_id if not provided
    if (!req.body.exercise_id) {
      const count = await Exercise.countDocuments();
      req.body.exercise_id = `ex${String(count + 1).padStart(3, '0')}`;
    }
    const e = await Exercise.create(req.body);
    res.status(201).json(e);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add exercise to user's custom library
router.post('/custom/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Generate exercise_id if not provided
    if (!req.body.exercise_id) {
      const customCount = user.custom_exercises ? user.custom_exercises.length : 0;
      req.body.exercise_id = `user_${req.params.userId}_ex${String(customCount + 1).padStart(3, '0')}`;
    }
    
    // Check if exercise already exists in user's custom exercises
    const exists = user.custom_exercises?.some(ex => 
      ex.exercise_id === req.body.exercise_id || ex.name.toLowerCase() === req.body.name.toLowerCase()
    );
    
    if (exists) {
      return res.status(400).json({ error: 'Exercise already exists in your library' });
    }
    
    user.custom_exercises = user.custom_exercises || [];
    user.custom_exercises.push({
      exercise_id: req.body.exercise_id,
      name: req.body.name,
      type: req.body.type || 'Custom'
    });
    
    await user.save();
    res.status(201).json({ message: 'Exercise added to your library', exercise: user.custom_exercises[user.custom_exercises.length - 1] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete exercise from user's custom library
router.delete('/custom/:userId/:exerciseId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.custom_exercises = user.custom_exercises.filter(ex => ex.exercise_id !== req.params.exerciseId);
    await user.save();
    res.json({ message: 'Exercise removed from your library' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update custom exercise for a user
router.put('/custom/:userId/:exerciseId', async (req, res) => {
  try {
    const { name, type } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Find the custom exercise in the user's array
    const exercise = user.custom_exercises?.find(ex => ex.exercise_id === req.params.exerciseId);
    
    if (!exercise) return res.status(404).json({ error: 'Custom exercise not found' });
    
    // Check if new name already exists in custom exercises (if name is being changed)
    if (name && name !== exercise.name) {
      const nameExists = user.custom_exercises.some(ex => 
        ex.name.toLowerCase() === name.toLowerCase() && ex.exercise_id !== req.params.exerciseId
      );
      if (nameExists) return res.status(400).json({ error: 'Exercise name already exists in your library' });
    }
    
    // Update the exercise fields
    if (name !== undefined) exercise.name = name;
    if (type !== undefined) exercise.type = type;
    
    await user.save();
    res.json({ message: 'Custom exercise updated', exercise });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete exercise from global library
router.delete('/:id', async (req, res) => {
  try {
    const e = await Exercise.findByIdAndDelete(req.params.id);
    if (!e) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise deleted from global library', exercise: e });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
