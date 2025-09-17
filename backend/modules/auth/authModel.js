const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');

class AuthModel {
  static async createUser({ email, password }) {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, password_hash]
    );
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  static async comparePassword(password, password_hash) {
    return bcrypt.compare(password, password_hash);
  }
}

module.exports = AuthModel;
