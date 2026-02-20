import express from 'express';
import db from './db';
import { supabase } from './supabase';

const router = express.Router();

// Sync User (Create if not exists in local DB)
router.post('/sync', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { email, name } = req.body;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user exists in local DB
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const existingUser = stmt.get(user.id);

    if (!existingUser) {
      const insert = db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)');
      insert.run(user.id, email, name);
    }

    // Check profile
    const profileStmt = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?');
    const profile = profileStmt.get(user.id);

    res.json({ user: { id: user.id, email, name }, hasProfile: !!profile });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
