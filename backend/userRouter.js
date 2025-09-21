import { Router } from 'express';
import { pool } from './index.js';
import { hash, compare } from 'bcrypt';       
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'; 


router.post('/signup', async (req, res, next) => {
  try {
    const { user } = req.body || {};
    if (!user?.email || !user?.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const passwordHash = await hash(user.password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [user.email, passwordHash]
    );
    return res.status(201).json({ id: rows[0].id, email: rows[0].email });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    next(err);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { user } = req.body || {};
    if (!user?.email || !user?.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1',
      [user.email]
    );
    const dbUser = rows[0];
    if (!dbUser) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await compare(user.password, dbUser.password_hash); 
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ sub: dbUser.id, email: dbUser.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ id: dbUser.id, email: dbUser.email, token });
  } catch (err) {
    next(err);
  }
});

export default router;
