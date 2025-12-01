const mongoose = require('mongoose');

const CustomExerciseSchema = new mongoose.Schema({
  exercise_id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'Custom' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  weight_lbs: Number,
  custom_exercises: [CustomExerciseSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
