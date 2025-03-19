import { and, eq, inArray, like, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getDb, projects, requirements, requirementTags } from "./db/index.js";
import {
  NewProject,
  NewRequirement,
  Project,
  Requirement,
  RequirementStatus,
} from "./types.js";

/**
 * Get all projects from the database
 */
async function getProjects(): Promise<Project[]> {
  try {
    const db = getDb();
    return await db.select().from(projects);
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

/**
 * Create a new project in the database
 */
async function createProject(newProject: NewProject): Promise<Project> {
  try {
    const db = getDb();
    const project: Project = {
      ...newProject,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(projects).values(project);
    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

/**
 * Update an existing project in the database
 */
async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project | null> {
  try {
    const db = getDb();
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .get();

    if (!project) {
      return null;
    }

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.update(projects).set(updatedProject).where(eq(projects.id, id));

    return updatedProject;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

/**
 * Delete a project and all its requirements from the database
 */
async function deleteProject(id: string): Promise<boolean> {
  try {
    const db = getDb();
    // The cascade will handle deleting requirements and tags
    const result = await db.delete(projects).where(eq(projects.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}

/**
 * Get all requirements from the database with their tags
 */
async function getRequirements(): Promise<Requirement[]> {
  try {
    const db = getDb();
    const reqs = await db.select().from(requirements);

    if (reqs.length === 0) {
      return [];
    }

    const reqIds = reqs.map((r) => r.id);
    const tags = await db
      .select()
      .from(requirementTags)
      .where(inArray(requirementTags.requirementId, reqIds));

    // Group tags by requirement ID
    const tagsByReqId = tags.reduce((acc, { requirementId, tag }) => {
      if (!acc[requirementId]) {
        acc[requirementId] = [];
      }
      acc[requirementId].push(tag);
      return acc;
    }, {} as Record<string, string[]>);

    // Merge tags with requirements
    return reqs.map((req) => ({
      ...req,
      tags: tagsByReqId[req.id] || [],
    }));
  } catch (error) {
    console.error("Error reading requirements:", error);
    return [];
  }
}

/**
 * Create a new requirement in the database
 */
async function createRequirement(
  newRequirement: NewRequirement
): Promise<Requirement> {
  try {
    const db = getDb();
    const requirement: Requirement = {
      ...newRequirement,
      id: uuidv4(),
      tags: newRequirement.tags || [],
      status: RequirementStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use a transaction to ensure both requirement and tags are created
    return await db.transaction(async (tx) => {
      // Insert requirement
      await tx.insert(requirements).values({
        id: requirement.id,
        title: requirement.title,
        description: requirement.description,
        type: requirement.type,
        priority: requirement.priority,
        status: requirement.status,
        projectId: requirement.projectId,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
      });

      // Insert tags if any
      if (requirement.tags.length > 0) {
        await tx.insert(requirementTags).values(
          requirement.tags.map((tag) => ({
            requirementId: requirement.id,
            tag,
          }))
        );
      }

      return requirement;
    });
  } catch (error) {
    console.error("Error creating requirement:", error);
    throw error;
  }
}

/**
 * Update an existing requirement in the database
 */
async function updateRequirement(
  id: string,
  updates: Partial<Requirement>
): Promise<Requirement | null> {
  try {
    const db = getDb();
    const req = await db
      .select()
      .from(requirements)
      .where(eq(requirements.id, id))
      .get();

    if (!req) {
      return null;
    }

    // Get existing tags
    const existingTags = await db
      .select()
      .from(requirementTags)
      .where(eq(requirementTags.requirementId, id));

    const existingTagValues = existingTags.map((t) => t.tag);

    // Use transaction to update requirement and tags
    await db.transaction(async (tx) => {
      // Update requirement
      await tx
        .update(requirements)
        .set({
          ...(updates.title && { title: updates.title }),
          ...(updates.description && { description: updates.description }),
          ...(updates.type && { type: updates.type }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.status && { status: updates.status }),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(requirements.id, id));

      // Update tags if provided
      if (updates.tags) {
        // Delete tags that are no longer in the list
        const tagsToDelete = existingTagValues.filter(
          (t) => !updates.tags?.includes(t)
        );
        if (tagsToDelete.length > 0) {
          await tx
            .delete(requirementTags)
            .where(
              and(
                eq(requirementTags.requirementId, id),
                inArray(requirementTags.tag, tagsToDelete)
              )
            );
        }

        // Add new tags
        const tagsToAdd = updates.tags.filter(
          (t) => !existingTagValues.includes(t)
        );
        if (tagsToAdd.length > 0) {
          await tx.insert(requirementTags).values(
            tagsToAdd.map((tag) => ({
              requirementId: id,
              tag,
            }))
          );
        }
      }
    });

    // Fetch the updated requirement with tags
    const updatedReq = await db
      .select()
      .from(requirements)
      .where(eq(requirements.id, id))
      .get();

    if (!updatedReq) {
      return null;
    }

    const updatedTags = await db
      .select()
      .from(requirementTags)
      .where(eq(requirementTags.requirementId, id));

    return {
      ...updatedReq,
      tags: updatedTags.map((t) => t.tag),
    };
  } catch (error) {
    console.error("Error updating requirement:", error);
    throw error;
  }
}

/**
 * Delete a requirement from the database
 */
async function deleteRequirement(id: string): Promise<boolean> {
  try {
    const db = getDb();
    // The cascade will handle deleting tags
    await db.delete(requirements).where(eq(requirements.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting requirement:", error);
    return false;
  }
}

/**
 * Get requirements for a specific project
 */
async function getRequirementsByProject(
  projectId: string
): Promise<Requirement[]> {
  try {
    const db = getDb();
    const reqs = await db
      .select()
      .from(requirements)
      .where(eq(requirements.projectId, projectId));

    if (reqs.length === 0) {
      return [];
    }

    const reqIds = reqs.map((r) => r.id);

    const tags = await db
      .select()
      .from(requirementTags)
      .where(inArray(requirementTags.requirementId, reqIds));

    // Group tags by requirement ID
    const tagsByReqId = tags.reduce((acc, { requirementId, tag }) => {
      if (!acc[requirementId]) {
        acc[requirementId] = [];
      }
      acc[requirementId].push(tag);
      return acc;
    }, {} as Record<string, string[]>);

    // Merge tags with requirements
    return reqs.map((req) => ({
      ...req,
      tags: tagsByReqId[req.id] || [],
    }));
  } catch (error) {
    console.error("Error fetching requirements by project:", error);
    return [];
  }
}

/**
 * Find projects by name (case insensitive search)
 */
async function findProjectsByName(searchTerm: string): Promise<Project[]> {
  try {
    const db = getDb();
    if (!searchTerm) {
      return await getProjects();
    }

    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    // Use SQL's LOWER function instead of JavaScript's toLowerCase
    return await db
      .select()
      .from(projects)
      .where(like(sql`LOWER(${projects.name})`, searchPattern));
  } catch (error) {
    console.error("Error finding projects by name:", error);
    return [];
  }
}

/**
 * Get a project by ID
 */
async function getProjectById(id: string): Promise<Project | null> {
  try {
    const db = getDb();
    return (
      (await db.select().from(projects).where(eq(projects.id, id)).get()) ||
      null
    );
  } catch (error) {
    console.error("Error getting project by ID:", error);
    return null;
  }
}

export {
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
};
