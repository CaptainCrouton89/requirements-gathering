#!/usr/bin/env node

import { migrateData } from "../lib/migrate-data.js";

async function main() {
  console.log("=== JSON to SQLite Migration Tool ===");
  console.log("This tool will migrate data from JSON files to SQLite database");
  console.log("Make sure the server is not running during migration");
  console.log("");

  try {
    const result = await migrateData();

    if (result.success) {
      console.log("");
      console.log("=== Migration completed successfully ===");
      console.log(`Projects migrated: ${result.projectsCount}`);
      console.log(`Requirements migrated: ${result.requirementsCount}`);
      console.log("");
      console.log("You can now start using the SQLite storage implementation");
      process.exit(0);
    } else {
      console.error("");
      console.error("=== Migration failed ===");
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error("");
    console.error("=== Migration failed with an unexpected error ===");
    console.error(error);
    process.exit(1);
  }
}

main();
