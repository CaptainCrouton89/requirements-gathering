import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs/promises";
import path from "path";

// Define database path - use the same directory as the JSON file
const DATA_DIR = process.env.DATA_DIR || "/Users/silasrhyneer/AI/db";
const DB_PATH = path.join(DATA_DIR, "requirements.db");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
    throw error;
  }
}

// Initialize database connection
let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

/**
 * Initialize the database connection and run migrations
 */
export async function initializeDatabase() {
  try {
    await ensureDataDir();

    // Initialize sqlite connection
    sqlite = new Database(DB_PATH);

    // Set pragmas for performance and integrity
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    // Create drizzle instance
    db = drizzle(sqlite);
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Initialize database on module import
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
})();

// Export the drizzle instance
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

// Export schemas
export * from "./schema.js";
