const mongoose = require('mongoose');

const PRSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exercise_id: { type: String, required: true },
  best_weight: Number,
  date_set: Date
});

PRSchema.index({ user_id: 1, exercise_id: 1 }, { unique: true });

module.exports = mongoose.model('PersonalRecord', PRSchema);
