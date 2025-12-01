const express = require('express');
const router = express.Router();
const User = require('../models/User');

// List all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const u = await User.create(req.body);
    res.status(201).json(u);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json(u);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user profile (name, email, age, weight_lbs)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, age, weight_lbs } = req.body;
    const updateData = {};
    
    // Only include fields that were provided
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (age !== undefined) updateData.age = age;
    if (weight_lbs !== undefined) updateData.weight_lbs = weight_lbs;
    
    const u = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'User deleted successfully', user: u });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;