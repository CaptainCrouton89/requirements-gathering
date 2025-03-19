import Database from "better-sqlite3";
import path from "path";

// Set data directory from environment variable or use default
const DATA_DIR =
  process.env.DATA_DIR || "/Users/silasrhyneer/AI/requirements/testdata";
const DB_PATH = path.join(DATA_DIR, "requirements.db");

try {
  console.log(`Checking SQLite database at: ${DB_PATH}`);

  // Open database connection
  const db = new Database(DB_PATH);

  // Set pragmas for performance and integrity
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Get list of tables
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table';")
    .all();
  console.log(
    "Tables in database:",
    tables.map((t) => t.name)
  );

  // Check if our expected tables exist
  if (tables.some((t) => t.name === "projects")) {
    console.log("\nProjects table exists, checking content:");
    const projects = db.prepare("SELECT * FROM projects;").all();
    console.log(`Found ${projects.length} projects:`);
    console.log(JSON.stringify(projects, null, 2));
  } else {
    console.log("\nProjects table does not exist!");
  }

  if (tables.some((t) => t.name === "requirements")) {
    console.log("\nRequirements table exists, checking content:");
    const requirements = db.prepare("SELECT * FROM requirements;").all();
    console.log(`Found ${requirements.length} requirements:`);
    console.log(JSON.stringify(requirements, null, 2));
  } else {
    console.log("\nRequirements table does not exist!");
  }

  if (tables.some((t) => t.name === "requirement_tags")) {
    console.log("\nRequirement_tags table exists, checking content:");
    const tags = db.prepare("SELECT * FROM requirement_tags;").all();
    console.log(`Found ${tags.length} requirement tags:`);
    console.log(JSON.stringify(tags, null, 2));
  } else {
    console.log("\nRequirement_tags table does not exist!");
  }

  // Close database connection
  db.close();
} catch (error) {
  console.error("Error checking SQLite database:", error);
}
