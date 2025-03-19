import Database from "better-sqlite3";
import path from "path";

// First clear out test database and try again
// This is a clean approach

// Define paths
const DATA_DIR = "/Users/silasrhyneer/AI/requirements/testdata";
const DB_PATH = path.join(DATA_DIR, "requirements.db");

try {
  console.log(`=== Fixing SQLite setup script ===`);
  console.log(`Database path: ${DB_PATH}`);

  // Open database connection
  const db = new Database(DB_PATH);

  // Set pragmas
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  console.log("\nDropping existing tables if they exist...");

  // Drop existing tables to start fresh (in reverse order to respect foreign key constraints)
  db.exec("DROP TABLE IF EXISTS requirement_tags;");
  db.exec("DROP TABLE IF EXISTS requirements;");
  db.exec("DROP TABLE IF EXISTS projects;");

  console.log("Creating tables...");

  // Create tables
  db.exec(`
    CREATE TABLE projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE requirements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      project_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE requirement_tags (
      requirement_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (requirement_id, tag),
      FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE CASCADE
    );
  `);

  console.log("Tables created successfully!\n");

  // Close database connection
  db.close();

  console.log("Now you can run the manual-migrate.js script to insert data");
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}
