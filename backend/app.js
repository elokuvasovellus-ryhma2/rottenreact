// app.js
import express from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/authRoutes.js';
import reviewRoutes from './modules/reviews/reviewRoutes.js';
import favoritesRoutes from './modules/favorites/favoritesRoutes.js';
import GroupRoutes from './modules/Group/GroupRoutes.js';
import groupPinnedMoviesRoutes from './modules/group_pinned_movies/group_pinned_moviesRoutes.js';

const app = express();

// Middlewaret
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Reitit
app.use('/users', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/Group', GroupRoutes);
app.use('/group-pinned-movies', groupPinnedMoviesRoutes);

// Healthcheck, hyödyllinen testeissä
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Virheenkäsittely
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

export default app;
