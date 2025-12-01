// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const usersRouter = require('./routes/users');
const exercisesRouter = require('./routes/exercises');
const templatesRouter = require('./routes/templates');
const workoutsRouter = require('./routes/workouts');
const prsRouter = require('./routes/prs');

// Initialize express
const app = express();

// Middleware
app.use(cors());               // Allow frontend to communicate
app.use(express.json());       // Parse JSON request bodies (built-in for Express 5.x)

// Register routes with prefixes
app.use('/api/users', usersRouter);
app.use('/api/exercises', exercisesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/prs', prsRouter);

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gymtracker';

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('💾 Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
