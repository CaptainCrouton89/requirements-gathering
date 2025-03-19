import fs from "fs/promises";
import path from "path";
import {
  getDb,
  initializeDatabase,
  projects,
  requirements,
  requirementTags,
} from "./db/index.js";
import { Project, Requirement } from "./types.js";

// JSON file paths (from the old storage)
const DATA_DIR = process.env.DATA_DIR || "/Users/silasrhyneer/AI/requirements";
const REQUIREMENTS_FILE = path.join(DATA_DIR, "requirements.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

/**
 * Migrate data from JSON files to SQLite database
 */
export async function migrateData() {
  try {
    console.log("Starting data migration to SQLite...");

    // Initialize database (creates tables if needed)
    await initializeDatabase();
    const db = getDb();

    // Read existing JSON data
    console.log("Reading existing JSON data...");
    let projectsData: Project[] = [];
    let requirementsData: Requirement[] = [];

    try {
      const projectsJson = await fs.readFile(PROJECTS_FILE, "utf-8");
      projectsData = JSON.parse(projectsJson) as Project[];
      console.log(`Found ${projectsData.length} projects in JSON file`);
    } catch (error) {
      console.warn("Could not read projects JSON file:", error);
      console.log("Continuing with empty projects data");
    }

    try {
      const requirementsJson = await fs.readFile(REQUIREMENTS_FILE, "utf-8");
      requirementsData = JSON.parse(requirementsJson) as Requirement[];
      console.log(`Found ${requirementsData.length} requirements in JSON file`);
    } catch (error) {
      console.warn("Could not read requirements JSON file:", error);
      console.log("Continuing with empty requirements data");
    }

    // Migrate projects
    if (projectsData.length > 0) {
      console.log(`Migrating ${projectsData.length} projects...`);
      for (const project of projectsData) {
        try {
          await db.insert(projects).values(project);
          console.log(`Migrated project: ${project.id} - ${project.name}`);
        } catch (error) {
          console.error(`Error migrating project ${project.id}:`, error);
        }
      }
    }

    // Migrate requirements and tags
    if (requirementsData.length > 0) {
      console.log(`Migrating ${requirementsData.length} requirements...`);
      for (const req of requirementsData) {
        try {
          // Extract tags
          const { tags, ...requirementData } = req;

          // Insert requirement
          await db.insert(requirements).values(requirementData);

          // Insert tags
          if (tags && tags.length > 0) {
            await db.insert(requirementTags).values(
              tags.map((tag) => ({
                requirementId: req.id,
                tag,
              }))
            );
          }
          console.log(`Migrated requirement: ${req.id} - ${req.title}`);
        } catch (error) {
          console.error(`Error migrating requirement ${req.id}:`, error);
        }
      }
    }

    console.log("Data migration completed successfully.");

    // Create backup of JSON files
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    try {
      await fs.copyFile(PROJECTS_FILE, `${PROJECTS_FILE}.${timestamp}.bak`);
      await fs.copyFile(
        REQUIREMENTS_FILE,
        `${REQUIREMENTS_FILE}.${timestamp}.bak`
      );
      console.log("Created backup of original JSON files.");
    } catch (error) {
      console.warn("Could not create backup of JSON files:", error);
    }

    return {
      success: true,
      projectsCount: projectsData.length,
      requirementsCount: requirementsData.length,
    };
  } catch (error) {
    console.error("Error during data migration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Run migration if this script is executed directly
if (typeof require !== "undefined" && require.main === module) {
  migrateData()
    .then((result) => {
      console.log("Migration result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
