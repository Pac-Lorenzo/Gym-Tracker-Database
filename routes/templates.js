const express = require('express');
const router = express.Router();
const Template = require('../models/Template');

// Get all global templates
router.get('/global', async (req, res) => {
  try {
    const templates = await Template.find({ is_global: true }).sort({ name: 1 });
    res.json(templates);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get combined library (global + user templates)
router.get('/library/:userId', async (req, res) => {
  try {
    const globalTemplates = await Template.find({ is_global: true }).sort({ name: 1 });
    const userTemplates = await Template.find({ user_id: req.params.userId, is_global: false }).sort({ name: 1 });
    
    res.json({
      global: globalTemplates,
      custom: userTemplates,
      combined: [...globalTemplates.map(t => ({ ...t.toObject(), source: 'global' })), 
                 ...userTemplates.map(t => ({ ...t.toObject(), source: 'user' }))]
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create template (global or user)
router.post('/', async (req, res) => {
  try {
    const templateData = {
      name: req.body.name,
      exercises: req.body.exercises || [],
      is_global: req.body.is_global || false
    };
    
    // Only set user_id if not global
    if (!templateData.is_global) {
      if (!req.body.user_id) {
        return res.status(400).json({ error: 'user_id required for user templates' });
      }
      templateData.user_id = req.body.user_id;
    }
    
    const t = await Template.create(templateData);
    res.status(201).json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get template by ID
router.get('/byid/:id', async (req, res) => {
  try {
    const t = await Template.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Template not found' });
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List by user (backward compatibility)
router.get('/:userId', async (req, res) => {
  try {
    const t = await Template.find({ user_id: req.params.userId, is_global: false }).sort({ name: 1 });
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a user (custom) template
router.put('/custom/:userId/:templateId', async (req, res) => {
  try {
    const { name, exercises } = req.body;
    const t = await Template.findById(req.params.templateId);
    if (!t) return res.status(404).json({ error: 'Template not found' });

    // Only allow updates to non-global (user) templates
    if (t.is_global) return res.status(403).json({ error: 'Cannot modify global templates' });

    // Ensure the template belongs to the provided userId
    if (String(t.user_id) !== String(req.params.userId)) {
      return res.status(403).json({ error: 'Template does not belong to this user' });
    }

    // Apply updates (only provided fields)
    if (name !== undefined) t.name = name;
    if (exercises !== undefined) t.exercises = exercises;

    await t.save();
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    const t = await Template.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ error: 'Template not found' });
    res.json({ message: 'Template deleted successfully', template: t });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;