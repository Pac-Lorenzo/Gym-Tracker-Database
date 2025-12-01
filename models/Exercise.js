const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  exercise_id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  type: { type: String, default: 'Strength' },
  muscle_groups: [String]
}, { timestamps: true });

module.exports = mongoose.model('Exercise', ExerciseSchema);
