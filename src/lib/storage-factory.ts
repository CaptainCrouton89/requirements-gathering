// Import both storage implementations
import * as sqliteStorage from "./sqlite-storage.js";
import * as jsonStorage from "./storage.js";

/**
 * Storage implementations
 */
export enum StorageType {
  JSON = "json",
  SQLITE = "sqlite",
}

/**
 * Default to SQLite if available, fallback to JSON
 */
const DEFAULT_STORAGE_TYPE = process.env.STORAGE_TYPE || StorageType.SQLITE;

/**
 * Get the appropriate storage implementation based on configuration
 */
export function getStorage() {
  const storageType = process.env.STORAGE_TYPE || DEFAULT_STORAGE_TYPE;

  switch (storageType.toLowerCase()) {
    case StorageType.SQLITE:
      console.log("Using SQLite storage");
      return sqliteStorage;
    case StorageType.JSON:
      console.log("Using JSON storage");
      return jsonStorage;
    default:
      console.warn(
        `Unknown storage type: ${storageType}, falling back to JSON`
      );
      return jsonStorage;
  }
}

// Get the storage implementation
const storage = getStorage();

// Export all storage functions
export const {
  createProject,
  createRequirement,
  deleteProject,
  deleteRequirement,
  findProjectsByName,
  getProjectById,
  getProjects,
  getRequirements,
  getRequirementsByProject,
  updateProject,
  updateRequirement,
} = storage;
