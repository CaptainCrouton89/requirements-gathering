import { z } from "zod";
import { FileRequirementsStore } from "../store";

// Initialize the requirements store
const store = new FileRequirementsStore();

// Ensure data is loaded before tools are used
let isInitialized = false;
const initializeStore = async () => {
  if (!isInitialized) {
    await store.load();
    isInitialized = true;
  }
};

// Define the schema for a requirement
const requirementSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  category: z.string(),
  status: z
    .enum(["proposed", "approved", "rejected", "implemented"])
    .default("proposed"),
});

// Define the schema for a stakeholder
const stakeholderSchema = z.object({
  name: z.string(),
  role: z.string(),
  contactInfo: z.string().optional(),
  requirements: z.array(z.string()).default([]),
});

// Define the schema for a project
const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  status: z
    .enum(["planning", "in-progress", "completed", "on-hold"])
    .default("planning"),
  requirements: z.array(z.string()).default([]),
  stakeholders: z.array(z.string()).default([]),
});

// Schema for requirement update
const updateRequirementSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  category: z.string().optional(),
  status: z
    .enum(["proposed", "approved", "rejected", "implemented"])
    .optional(),
  updatedBy: z.string(),
});

// Schema for filtering requirements
const listRequirementsSchema = z.object({
  category: z.string().optional(),
  status: z
    .enum(["proposed", "approved", "rejected", "implemented"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

// Schema for getting a requirement by ID
const requirementIdSchema = z.object({
  id: z.string(),
});

// MCP tool for adding a new requirement
export const addRequirementTool = {
  schema: requirementSchema,
  handler: async (params: z.infer<typeof requirementSchema>) => {
    await initializeStore();

    const requirement = store.addRequirement(params);
    await store.save();

    return {
      content: [
        {
          type: "text",
          text: `Requirement created successfully with ID: ${requirement.id}`,
        },
      ],
    };
  },
};

// MCP tool for updating an existing requirement
export const updateRequirementTool = {
  schema: updateRequirementSchema,
  handler: async (params: z.infer<typeof updateRequirementSchema>) => {
    await initializeStore();

    const { id, updatedBy, ...updates } = params;

    try {
      const requirement = store.updateRequirement(id, updates, updatedBy);
      await store.save();

      return {
        content: [
          {
            type: "text",
            text: `Requirement ${id} updated successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${(error as Error).message}`,
          },
        ],
      };
    }
  },
};

// MCP tool for listing all requirements
export const listRequirementsTool = {
  schema: listRequirementsSchema,
  handler: async (params: z.infer<typeof listRequirementsSchema>) => {
    await initializeStore();

    let requirements = Object.values(store.requirements);

    // Apply filters if provided
    if (params.category) {
      requirements = requirements.filter(
        (req) => req.category === params.category
      );
    }

    if (params.status) {
      requirements = requirements.filter((req) => req.status === params.status);
    }

    if (params.priority) {
      requirements = requirements.filter(
        (req) => req.priority === params.priority
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(requirements, null, 2),
        },
      ],
    };
  },
};

// MCP tool for getting a specific requirement by ID
export const getRequirementTool = {
  schema: requirementIdSchema,
  handler: async (params: z.infer<typeof requirementIdSchema>) => {
    await initializeStore();

    const requirement = store.requirements[params.id];

    if (!requirement) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Requirement with ID ${params.id} not found`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(requirement, null, 2),
        },
      ],
    };
  },
};

// MCP tool for adding a stakeholder
export const addStakeholderTool = {
  schema: stakeholderSchema,
  handler: async (params: z.infer<typeof stakeholderSchema>) => {
    await initializeStore();

    const stakeholder = store.addStakeholder(params);
    await store.save();

    return {
      content: [
        {
          type: "text",
          text: `Stakeholder created successfully with ID: ${stakeholder.id}`,
        },
      ],
    };
  },
};

// MCP tool for adding a project
export const addProjectTool = {
  schema: projectSchema,
  handler: async (params: z.infer<typeof projectSchema>) => {
    await initializeStore();

    const project = store.addProject(params);
    await store.save();

    return {
      content: [
        {
          type: "text",
          text: `Project created successfully with ID: ${project.id}`,
        },
      ],
    };
  },
};

// MCP tool for getting requirement history
export const getRequirementHistoryTool = {
  schema: requirementIdSchema,
  handler: async (params: z.infer<typeof requirementIdSchema>) => {
    await initializeStore();

    const updates = store.updates.filter(
      (update) => update.requirementId === params.id
    );

    if (updates.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No history found for requirement with ID ${params.id}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(updates, null, 2),
        },
      ],
    };
  },
};
