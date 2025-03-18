import fs from "fs/promises";
import path from "path";
import {
  Project,
  Requirement,
  RequirementUpdate,
  RequirementsStore,
  Stakeholder,
} from "./types";

export class FileRequirementsStore implements RequirementsStore {
  requirements: Record<string, Requirement> = {};
  stakeholders: Record<string, Stakeholder> = {};
  projects: Record<string, Project> = {};
  updates: RequirementUpdate[] = [];

  private filePath: string;

  constructor(filePath: string = "./data/requirements.json") {
    this.filePath = filePath;
  }

  async save(): Promise<void> {
    try {
      const dirPath = path.dirname(this.filePath);
      await fs.mkdir(dirPath, { recursive: true });

      const data = {
        requirements: this.requirements,
        stakeholders: this.stakeholders,
        projects: this.projects,
        updates: this.updates,
      };

      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save requirements data:", error);
      throw error;
    }
  }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data);

      this.requirements = parsed.requirements || {};
      this.stakeholders = parsed.stakeholders || {};
      this.projects = parsed.projects || {};
      this.updates = parsed.updates || [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // File doesn't exist yet, initialize with empty data
        await this.save();
      } else {
        console.error("Failed to load requirements data:", error);
        throw error;
      }
    }
  }

  // Helper methods for working with requirements
  addRequirement(
    requirement: Omit<Requirement, "id" | "createdAt" | "updatedAt">
  ): Requirement {
    const id = Date.now().toString();
    const now = new Date().toISOString();

    const newRequirement: Requirement = {
      id,
      ...requirement,
      createdAt: now,
      updatedAt: now,
    };

    this.requirements[id] = newRequirement;
    return newRequirement;
  }

  updateRequirement(
    id: string,
    updates: Partial<Requirement>,
    updatedBy: string
  ): Requirement {
    const requirement = this.requirements[id];
    if (!requirement) {
      throw new Error(`Requirement with ID ${id} not found`);
    }

    const now = new Date().toISOString();

    // Record updates for tracking changes
    Object.entries(updates).forEach(([field, newValue]) => {
      const oldValue = String(requirement[field as keyof Requirement] || "");
      this.updates.push({
        requirementId: id,
        field,
        oldValue,
        newValue: String(newValue),
        timestamp: now,
        updatedBy,
      });
    });

    const updatedRequirement = {
      ...requirement,
      ...updates,
      updatedAt: now,
    };

    this.requirements[id] = updatedRequirement;
    return updatedRequirement;
  }

  // Stakeholder management methods
  addStakeholder(stakeholder: Omit<Stakeholder, "id">): Stakeholder {
    const id = Date.now().toString();

    const newStakeholder: Stakeholder = {
      id,
      ...stakeholder,
    };

    this.stakeholders[id] = newStakeholder;
    return newStakeholder;
  }

  // Project management methods
  addProject(project: Omit<Project, "id">): Project {
    const id = Date.now().toString();

    const newProject: Project = {
      id,
      ...project,
    };

    this.projects[id] = newProject;
    return newProject;
  }
}
