require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Exercise = require('../models/Exercise.js');
const Template = require('../models/Template');
const Workout = require('../models/Workout');
const PR = require('../models/PersonalRecord');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Exercise.deleteMany({});
  await User.deleteMany({});
  await Template.deleteMany({});
  await Workout.deleteMany({});
  await PR.deleteMany({});

  // Create extensive exercise library
  const exercises = [
    // Upper Body - Chest
    { exercise_id: 'ex001', name: 'Bench Press', type: 'Strength', muscle_groups: ['Chest', 'Triceps', 'Shoulders'] },
    { exercise_id: 'ex002', name: 'Incline Bench Press', type: 'Strength', muscle_groups: ['Upper Chest', 'Triceps', 'Shoulders'] },
    { exercise_id: 'ex003', name: 'Dumbbell Flyes', type: 'Strength', muscle_groups: ['Chest', 'Shoulders'] },
    { exercise_id: 'ex004', name: 'Push-ups', type: 'Strength', muscle_groups: ['Chest', 'Triceps', 'Shoulders', 'Core'] },
    { exercise_id: 'ex005', name: 'Cable Crossover', type: 'Strength', muscle_groups: ['Chest', 'Shoulders'] },
    
    // Upper Body - Back
    { exercise_id: 'ex006', name: 'Deadlift', type: 'Strength', muscle_groups: ['Back', 'Hamstrings', 'Glutes', 'Core'] },
    { exercise_id: 'ex007', name: 'Pull-ups', type: 'Strength', muscle_groups: ['Back', 'Biceps', 'Shoulders'] },
    { exercise_id: 'ex008', name: 'Barbell Row', type: 'Strength', muscle_groups: ['Back', 'Biceps', 'Core'] },
    { exercise_id: 'ex009', name: 'Lat Pulldown', type: 'Strength', muscle_groups: ['Back', 'Biceps'] },
    { exercise_id: 'ex010', name: 'T-Bar Row', type: 'Strength', muscle_groups: ['Back', 'Biceps', 'Core'] },
    { exercise_id: 'ex011', name: 'Cable Row', type: 'Strength', muscle_groups: ['Back', 'Biceps'] },
    
    // Upper Body - Shoulders
    { exercise_id: 'ex012', name: 'Overhead Press', type: 'Strength', muscle_groups: ['Shoulders', 'Triceps', 'Core'] },
    { exercise_id: 'ex013', name: 'Lateral Raises', type: 'Strength', muscle_groups: ['Shoulders'] },
    { exercise_id: 'ex014', name: 'Front Raises', type: 'Strength', muscle_groups: ['Shoulders', 'Core'] },
    { exercise_id: 'ex015', name: 'Rear Delt Flyes', type: 'Strength', muscle_groups: ['Shoulders', 'Back'] },
    
    // Upper Body - Arms
    { exercise_id: 'ex016', name: 'Bicep Curls', type: 'Strength', muscle_groups: ['Biceps'] },
    { exercise_id: 'ex017', name: 'Tricep Dips', type: 'Strength', muscle_groups: ['Triceps', 'Shoulders', 'Chest'] },
    { exercise_id: 'ex018', name: 'Tricep Pushdown', type: 'Strength', muscle_groups: ['Triceps'] },
    { exercise_id: 'ex019', name: 'Hammer Curls', type: 'Strength', muscle_groups: ['Biceps', 'Forearms'] },
    
    // Lower Body
    { exercise_id: 'ex020', name: 'Squat', type: 'Strength', muscle_groups: ['Quads', 'Glutes', 'Core'] },
    { exercise_id: 'ex021', name: 'Leg Press', type: 'Strength', muscle_groups: ['Quads', 'Glutes', 'Hamstrings'] },
    { exercise_id: 'ex022', name: 'Romanian Deadlift', type: 'Strength', muscle_groups: ['Hamstrings', 'Glutes', 'Back'] },
    { exercise_id: 'ex023', name: 'Lunges', type: 'Strength', muscle_groups: ['Quads', 'Glutes', 'Hamstrings', 'Core'] },
    { exercise_id: 'ex024', name: 'Leg Curls', type: 'Strength', muscle_groups: ['Hamstrings'] },
    { exercise_id: 'ex025', name: 'Leg Extensions', type: 'Strength', muscle_groups: ['Quads'] },
    { exercise_id: 'ex026', name: 'Calf Raises', type: 'Strength', muscle_groups: ['Calves'] },
    { exercise_id: 'ex027', name: 'Bulgarian Split Squat', type: 'Strength', muscle_groups: ['Quads', 'Glutes', 'Core'] },
    
    // Core
    { exercise_id: 'ex028', name: 'Plank', type: 'Strength', muscle_groups: ['Core', 'Shoulders'] },
    { exercise_id: 'ex029', name: 'Russian Twists', type: 'Strength', muscle_groups: ['Core', 'Obliques'] },
    { exercise_id: 'ex030', name: 'Crunches', type: 'Strength', muscle_groups: ['Core'] },
    
    // Cardio
    { exercise_id: 'ex031', name: 'Running', type: 'Cardio', muscle_groups: ['Legs', 'Cardiovascular'] },
    { exercise_id: 'ex032', name: 'Cycling', type: 'Cardio', muscle_groups: ['Quads', 'Glutes', 'Cardiovascular'] },
  ];

  // Create all exercises and store references
  const createdExercises = {};
  for (const ex of exercises) {
    const created = await Exercise.create(ex);
    createdExercises[ex.exercise_id] = created;
  }

  // Store commonly used exercises for later reference
  const bench = createdExercises['ex001'];
  const squat = createdExercises['ex020'];

  const user = await User.create({ name: 'Paco Lorenzo', email: 'paco@example.com', age: 20, weight_lbs: 170 });

  // Create user template
  const userTemplate = await Template.create({
    user_id: user._id,
    name: 'Push Day',
    is_global: false,
    exercises: [{ exercise_id: bench.exercise_id, order: 1 }]
  });

  // Create global template
  const globalTemplate = await Template.create({
    user_id: null,
    name: 'Full Body Workout',
    is_global: true,
    exercises: [
      { exercise_id: bench.exercise_id, order: 1 },
      { exercise_id: squat.exercise_id, order: 2 }
    ]
  });

  const workout = await Workout.create({
    user_id: user._id,
    date: new Date('2025-11-15'),
    total_time_minutes: 65,
    exercises: [
      {
        exercise_id: bench.exercise_id,
        name: bench.name,
        is_custom: false,
        sets: [
          { set_id: 's1', weight: 135, reps: 8, difficulty: 6 },
          { set_id: 's2', weight: 185, reps: 5, difficulty: 8 }
        ]
      }
    ]
  });

  await PR.create({ user_id: user._id, exercise_id: bench.exercise_id, best_weight: 185, date_set: workout.date });

  console.log('Seed complete');
  console.log('User id:', user._id.toString());
  console.log('Exercise ids:', bench.exercise_id, squat.exercise_id);
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
