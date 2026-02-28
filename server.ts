import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import authRoutes from './server/auth';
import { apiRouter } from './server/routes';
import { supabase } from './server/supabase';
import { seedNutritionDatabase } from './server/seed_nutrition';

async function startServer() {
  // Seed Database
  seedNutritionDatabase();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
  app.use(cookieParser());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Auth Middleware
  app.use(async (req: any, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          req.user = user;
        }
      } catch (err) {
        // Invalid token
      }
    }
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  
  // Explicitly handle /api/profile here to debug 404
  app.post('/api/profile', async (req: any, res: any) => {
    console.log('Direct POST /api/profile handler called');
    
    // Auth check
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
      req.user = user;
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      age, gender, height, current_weight, goal_type, goal_weight,
      target_date, activity_level, daily_calories, protein_target,
      carbs_target, fat_target, water_target, preferred_language
    } = req.body;

    try {
      // Import db dynamically to avoid circular dependency issues if any
      const db = (await import('./server/db')).default;
      
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO user_profiles (
          user_id, age, gender, height, current_weight, goal_type, goal_weight,
          target_date, activity_level, daily_calories, protein_target,
          carbs_target, fat_target, water_target, preferred_language
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        req.user.id, age, gender, height, current_weight, goal_type, goal_weight,
        target_date, activity_level, daily_calories, protein_target,
        carbs_target, fat_target, water_target, preferred_language
      );

      // Initial weight log
      const weightStmt = db.prepare('INSERT INTO weight_logs (user_id, date, weight) VALUES (?, ?, ?)');
      weightStmt.run(req.user.id, new Date().toISOString().split('T')[0], current_weight);

      res.json({ message: 'Profile updated' });
    } catch (error) {
      console.error('Profile save error:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
  });

  app.use('/api', apiRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Explicit 404 for API routes to prevent falling through to Vite
  app.use('/api/*', (req, res) => {
    console.error(`API 404: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // But for this environment, we stick to dev mode mostly or serve dist
    // app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
