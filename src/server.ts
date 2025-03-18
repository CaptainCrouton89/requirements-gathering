/**
 * Express server configuration for requirements-gatherer
 */
import cors from 'cors';
import express, { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
try {
  await fs.mkdir(dataDir, { recursive: true });
  console.log(`Data directory created at: ${dataDir}`);
} catch (error) {
  console.error('Error creating data directory:', error);
}

// Import tools routes
import askClarifyingQuestionsTool from './tools/ask-clarifying-questions-tool.js';
import exampleTool from './tools/example-tool.js';
import generateSpecificationTool from './tools/generate-specification-tool.js';
import startRequirementsTool from './tools/start-requirements-tool.js';

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
apiRouter.use('/tools/start-requirements', startRequirementsTool);
apiRouter.use('/tools/ask-clarifying-questions', askClarifyingQuestionsTool);
apiRouter.use('/tools/generate-specification', generateSpecificationTool);
apiRouter.use('/tools/example', exampleTool);

// Import and register resource routes
import exampleResource from './resources/example-resource.js';
apiRouter.use('/resources/example', exampleResource);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Documentation endpoint
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    name: 'Requirements Gatherer API',
    description: 'API for gathering requirements and generating specifications',
    version: '1.0.0',
    tools: [
      {
        name: 'start-requirements',
        description: 'Start a new requirements gathering process',
        endpoint: '/api/tools/start-requirements'
      },
      {
        name: 'ask-clarifying-questions',
        description: 'Get or generate clarifying questions',
        endpoints: [
          '/api/tools/ask-clarifying-questions/ask',
          '/api/tools/ask-clarifying-questions/answer'
        ]
      },
      {
        name: 'generate-specification',
        description: 'Generate a specifications document',
        endpoint: '/api/tools/generate-specification'
      }
    ]
  });
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
      console.log(`Requirements Gatherer server started on port ${port}`);
      resolve();
    });
  });
}

export default app; 