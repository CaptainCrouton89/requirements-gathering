import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  NewProject,
  NewRequirement,
  Project,
  Requirement,
  RequirementStatus,
} from "./types.js";

// Storage paths
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const REQUIREMENTS_FILE = path.join(DATA_DIR, "requirements.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
    throw error;
  }
}

// Initialize storage files if they don't exist
async function initializeStorage() {
  await ensureDataDir();

  try {
    // Check if requirements file exists, create if not
    try {
      await fs.access(REQUIREMENTS_FILE);
    } catch {
      await fs.writeFile(REQUIREMENTS_FILE, JSON.stringify([]));
    }

    // Check if projects file exists, create if not
    try {
      await fs.access(PROJECTS_FILE);
    } catch {
      await fs.writeFile(PROJECTS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
    throw error;
  }
}

// Load requirements from storage
async function getRequirements(): Promise<Requirement[]> {
  try {
    const data = await fs.readFile(REQUIREMENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading requirements:", error);
    return [];
  }
}

// Save requirements to storage
async function saveRequirements(requirements: Requirement[]): Promise<void> {
  try {
    await fs.writeFile(
      REQUIREMENTS_FILE,
      JSON.stringify(requirements, null, 2)
    );
  } catch (error) {
    console.error("Error saving requirements:", error);
    throw error;
  }
}

// Load projects from storage
async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

// Save projects to storage
async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error("Error saving projects:", error);
    throw error;
  }
}

// Create a new requirement
async function createRequirement(
  newRequirement: NewRequirement
): Promise<Requirement> {
  const requirements = await getRequirements();

  const requirement: Requirement = {
    ...newRequirement,
    id: uuidv4(),
    tags: newRequirement.tags || [],
    status: RequirementStatus.DRAFT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  requirements.push(requirement);
  await saveRequirements(requirements);

  return requirement;
}

// Update an existing requirement
async function updateRequirement(
  id: string,
  updates: Partial<Requirement>
): Promise<Requirement | null> {
  const requirements = await getRequirements();
  const index = requirements.findIndex((req) => req.id === id);

  if (index === -1) {
    return null;
  }

  const updatedRequirement = {
    ...requirements[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  requirements[index] = updatedRequirement;
  await saveRequirements(requirements);

  return updatedRequirement;
}

// Delete a requirement
async function deleteRequirement(id: string): Promise<boolean> {
  const requirements = await getRequirements();
  const index = requirements.findIndex((req) => req.id === id);

  if (index === -1) {
    return false;
  }

  requirements.splice(index, 1);
  await saveRequirements(requirements);

  return true;
}

// Create a new project
async function createProject(newProject: NewProject): Promise<Project> {
  const projects = await getProjects();

  const project: Project = {
    ...newProject,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  projects.push(project);
  await saveProjects(projects);

  return project;
}

// Update an existing project
async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  const projects = await getProjects();
  const index = projects.findIndex((proj) => proj.id === id);

  if (index === -1) {
    return null;
  }

  const updatedProject = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updatedProject;
  await saveProjects(projects);

  return updatedProject;
}

// Delete a project
async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const index = projects.findIndex((proj) => proj.id === id);

  if (index === -1) {
    return false;
  }

  projects.splice(index, 1);
  await saveProjects(projects);

  return true;
}

// Initialize storage on module import
(async () => {
  try {
    await initializeStorage();
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    process.exit(1);
  }
})();

export {
  createProject,
  createRequirement,
  deleteProject,
  deleteRequirement,
  getProjects,
  getRequirements,
  updateProject,
  updateRequirement,
};
