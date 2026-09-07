import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { storyRouter } from './routes/story.routes.js';
import { acRouter } from './routes/ac.routes.js';
import { sprintRouter } from './routes/sprint.routes.js';
import { teamRouter } from './routes/team.routes.js';
import { settingsRouter } from './routes/settings.routes.js';

const app = express();

// CORS configuration supporting both local development and Render deployment
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, or allow origin
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (Used by Render and tests)
app.use('/api/health', healthRouter);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/stories', storyRouter);
app.use('/api', acRouter);
app.use('/api/sprints', sprintRouter);
app.use('/api/team', teamRouter);
app.use('/api/settings', settingsRouter);

// Fallback 404 handler for unmatched /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found.` });
});

// Centralized error handling
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[RefineBoard Server] Running on port ${PORT} in ${env.NODE_ENV} mode.`);
  console.log(`[RefineBoard Server] Health check available at: http://localhost:${PORT}/api/health`);
});

export default app;
