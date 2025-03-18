/**
 * Express server configuration for requirements-gatherer
 */
import express from 'express';
import cors from 'cors';
import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import tools routes
import exampleTool from './tools/example-tool.js';

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const apiRouter = Router();
app.use('/api', apiRouter);

// Register tool routes
apiRouter.use('/tools/example', exampleTool);

// Import and register resource routes
import exampleResource from './resources/example-resource.js';
apiRouter.use('/resources/example', exampleResource);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

/**
 * Start the Express server
 */
export async function startServer(port: number): Promise<void> {
  return new Promise((resolve) => {
    app.listen(port, () => {
      resolve();
    });
  });
}

export default app; 