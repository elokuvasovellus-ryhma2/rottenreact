const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');

// Import module routes
const authRoutes = require('./modules/auth/authRoutes');
//const userRoutes = require('./modules/users/userRoutes');
//const reviewRoutes = require('./modules/reviews/reviewRoutes');
//const movieRoutes = require('./modules/movies/movieRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

//app.use('/api/users', userRoutes);
//app.use('/api/reviews', reviewRoutes);
//app.use('/api/movies', movieRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
 
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);

  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});