const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Count and log the number of users only for testing purposes
    // const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    // const userCount = userCountResult.rows[0].count;
    // console.log(`Total number of users: ${userCount}`);
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};



module.exports = { pool, connectDB};
