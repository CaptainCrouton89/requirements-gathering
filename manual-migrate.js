import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Set data directory from environment variable or use default
const DATA_DIR =
  process.env.DATA_DIR || "/Users/silasrhyneer/AI/requirements/testdata";
const DB_PATH = path.join(DATA_DIR, "requirements.db");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const REQUIREMENTS_FILE = path.join(DATA_DIR, "requirements.json");

console.log(`=== Manual JSON to SQLite Migration ===`);
console.log(`Database path: ${DB_PATH}`);
console.log(`Projects JSON: ${PROJECTS_FILE}`);
console.log(`Requirements JSON: ${REQUIREMENTS_FILE}`);

try {
  // Open database connection
  const db = new Database(DB_PATH);

  // Set pragmas for performance and integrity
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Begin a transaction
  db.exec("BEGIN TRANSACTION;");

  // Read JSON files
  console.log(`\nReading JSON files...`);

  // Read projects
  const projectsJson = fs.readFileSync(PROJECTS_FILE, "utf8");
  const projects = JSON.parse(projectsJson);
  console.log(`Found ${projects.length} projects in JSON file`);

  // Read requirements
  const requirementsJson = fs.readFileSync(REQUIREMENTS_FILE, "utf8");
  const requirements = JSON.parse(requirementsJson);
  console.log(`Found ${requirements.length} requirements in JSON file`);

  // Prepare statements for inserting data
  console.log(`\nMigrating projects...`);
  const insertProject = db.prepare(
    `INSERT INTO projects (id, name, description, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?)`
  );

  // Insert projects
  let projectsInserted = 0;
  for (const project of projects) {
    try {
      insertProject.run(
        project.id,
        project.name,
        project.description,
        project.createdAt,
        project.updatedAt
      );
      projectsInserted++;
      console.log(`Migrated project: ${project.id} - ${project.name}`);
    } catch (error) {
      console.error(`Error migrating project ${project.id}:`, error.message);
    }
  }

  console.log(`\nMigrating requirements...`);
  const insertRequirement = db.prepare(
    `INSERT INTO requirements (id, title, description, type, priority, status, project_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const insertTag = db.prepare(
    `INSERT INTO requirement_tags (requirement_id, tag) 
     VALUES (?, ?)`
  );

  // Insert requirements and tags
  let requirementsInserted = 0;
  let tagsInserted = 0;

  for (const req of requirements) {
    try {
      insertRequirement.run(
        req.id,
        req.title,
        req.description,
        req.type,
        req.priority,
        req.status,
        req.projectId,
        req.createdAt,
        req.updatedAt
      );
      requirementsInserted++;
      console.log(`Migrated requirement: ${req.id} - ${req.title}`);

      // Insert tags
      if (req.tags && req.tags.length > 0) {
        for (const tag of req.tags) {
          try {
            insertTag.run(req.id, tag);
            tagsInserted++;
          } catch (tagError) {
            console.error(
              `Error migrating tag "${tag}" for requirement ${req.id}:`,
              tagError.message
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error migrating requirement ${req.id}:`, error.message);
    }
  }

  // Commit transaction
  db.exec("COMMIT;");

  console.log(`\n=== Migration completed successfully ===`);
  console.log(`Projects migrated: ${projectsInserted}`);
  console.log(`Requirements migrated: ${requirementsInserted}`);
  console.log(`Tags migrated: ${tagsInserted}`);

  // Close database connection
  db.close();
} catch (error) {
  console.error("\n=== Migration failed ===");
  console.error(error);
  process.exit(1);
}
