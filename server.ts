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
