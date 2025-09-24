import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail } from './authModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function signup(req, res, next) {
  try {
    const { user } = req.body || {};

    if (!user?.email || !user?.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const passwordHash = await hash(user.password, 10);
    const newUser = await createUser(user.email, passwordHash);

    return res.status(201).json(newUser); // { id, email }
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(err);
  }
}

export async function signin(req, res, next) {
  try {
    const { user } = req.body || {};

    if (!user?.email || !user?.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const dbUser = await getUserByEmail(user.email);

    if (!dbUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await compare(user.password, dbUser.password_hash);

    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { sub: dbUser.id, email: dbUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ id: dbUser.id, email: dbUser.email, token });
  } catch (err) {
    next(err);
  }
}
