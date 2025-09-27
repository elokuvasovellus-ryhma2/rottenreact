import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/authRoutes.js';
import reviewRoutes from './modules/reviews/reviewRoutes.js';
import favoritesRoutes from './modules/favorites/favoritesRoutes.js';
import { pool } from './config/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/favorites', favoritesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log(' Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer ();