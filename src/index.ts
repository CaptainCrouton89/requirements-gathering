/**
 * Entry point for requirements-gatherer
 * 
 * This file initializes and starts the MCP server for requirements gathering.
 */
import dotenv from 'dotenv';
import { startServer } from './server.js';

// Load environment variables
dotenv.config();

// Define the port
const PORT = parseInt(process.env.PORT || '3000', 10);

async function main() {
  try {
    // Start the server
    await startServer(PORT);
    console.log(`Requirements Gatherer server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});