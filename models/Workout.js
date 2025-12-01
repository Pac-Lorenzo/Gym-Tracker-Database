const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
  set_id: String,
  weight: Number,
  reps: Number,
  difficulty: Number // 1-10
}, { _id: false });

const WorkoutExerciseSchema = new mongoose.Schema({
  exercise_id: String,
  name: String,
  is_custom: { type: Boolean, default: false },
  sets: [SetSchema]
}, { _id: false });

const WorkoutSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  total_time_minutes: Number,
  exercises: [WorkoutExerciseSchema]
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);
