import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  Project,
  Requirement,
  RequirementUpdate,
  Stakeholder,
} from "./types.js";

const DATA_DIR = "/Users/silasrhyneer/AI/data";
const DATA_FILE = path.join(DATA_DIR, "requirements.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create data directory:", error);
  }
}

export class FileRequirementsStore {
  requirements: Record<string, Requirement> = {};
  stakeholders: Record<string, Stakeholder> = {};
  projects: Record<string, Project> = {};
  updates: RequirementUpdate[] = [];

  async load() {
    await ensureDataDir();

    try {
      const data = await fs.readFile(DATA_FILE, "utf8");
      const parsedData = JSON.parse(data);

      this.requirements = parsedData.requirements || {};
      this.stakeholders = parsedData.stakeholders || {};
      this.projects = parsedData.projects || {};
      this.updates = parsedData.updates || [];
    } catch (error) {
      // If file doesn't exist or is invalid JSON, use defaults
      console.log("No existing data found, initializing with empty store");
      this.requirements = {};
      this.stakeholders = {};
      this.projects = {};
      this.updates = [];
    }
  }

  async save() {
    await ensureDataDir();

    const data = JSON.stringify(
      {
        requirements: this.requirements,
        stakeholders: this.stakeholders,
        projects: this.projects,
        updates: this.updates,
      },
      null,
      2
    );

    await fs.writeFile(DATA_FILE, data, "utf8");
  }

  addRequirement(data: Omit<Requirement, "id" | "createdAt" | "updatedAt">) {
    const timestamp = new Date().toISOString();
    const requirement: Requirement = {
      id: uuidv4(),
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.requirements[requirement.id] = requirement;
    return requirement;
  }

  updateRequirement(
    id: string,
    updates: Partial<Requirement>,
    updatedBy: string
  ) {
    const requirement = this.requirements[id];

    if (!requirement) {
      throw new Error(`Requirement with ID ${id} not found`);
    }

    const timestamp = new Date().toISOString();
    const update: RequirementUpdate = {
      id: uuidv4(),
      requirementId: id,
      updatedBy,
      updatedFields: updates,
      timestamp,
    };

    // Update the requirement
    const updatedRequirement = {
      ...requirement,
      ...updates,
      updatedAt: timestamp,
    };

    this.requirements[id] = updatedRequirement;
    this.updates.push(update);

    return updatedRequirement;
  }

  addStakeholder(data: Omit<Stakeholder, "id" | "createdAt">) {
    const timestamp = new Date().toISOString();
    const stakeholder: Stakeholder = {
      id: uuidv4(),
      ...data,
      createdAt: timestamp,
    };

    this.stakeholders[stakeholder.id] = stakeholder;
    return stakeholder;
  }

  addProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    const timestamp = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.projects[project.id] = project;
    return project;
  }
}
