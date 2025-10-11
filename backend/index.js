import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/database.js';

dotenv.config();

const port = process.env.PORT || 3001;

async function startServer() {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
