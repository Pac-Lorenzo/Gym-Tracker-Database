const mongoose = require('mongoose');

const TemplateExerciseSchema = new mongoose.Schema({
  exercise_id: String,
  order: Number
}, { _id: false });

const TemplateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for global templates
  name: { type: String, required: true },
  exercises: [TemplateExerciseSchema],
  is_global: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Template', TemplateSchema);