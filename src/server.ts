import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { FileRequirementsStore } from "./store.js";
import type { Requirement, RequirementUpdate } from "./types.js";

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

// Create an MCP server for requirements gathering
const server = new McpServer({
  name: "Requirements Gathering",
  version: "1.0.0",
  description: "An MCP server for gathering and managing project requirements.",
});

// Define and register all our tools manually

// Tool: Add requirement
server.tool(
  "requirements/add",
  {
    title: z.string(),
    description: z.string(),
    priority: z.enum(["low", "medium", "high", "critical"]),
    category: z.string(),
    status: z
      .enum(["proposed", "approved", "rejected", "implemented"])
      .optional(),
  },
  async (params) => {
    await initializeStore();

    const requirement = store.addRequirement({
      title: params.title,
      description: params.description,
      priority: params.priority,
      category: params.category,
      status: params.status || "proposed",
    });

    await store.save();

    return {
      content: [
        {
          type: "text",
          text: `Requirement created successfully with ID: ${requirement.id}`,
        },
      ],
    };
  }
);

// Tool: Update requirement
server.tool(
  "requirements/update",
  {
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    category: z.string().optional(),
    status: z
      .enum(["proposed", "approved", "rejected", "implemented"])
      .optional(),
    updatedBy: z.string(),
  },
  async (params) => {
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
  }
);

// Tool: List requirements
server.tool(
  "requirements/list",
  {
    category: z.string().optional(),
    status: z
      .enum(["proposed", "approved", "rejected", "implemented"])
      .optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  },
  async (params) => {
    await initializeStore();

    let requirements = Object.values(store.requirements);

    // Apply filters if provided
    if (params.category) {
      requirements = requirements.filter(
        (req: Requirement) => req.category === params.category
      );
    }

    if (params.status) {
      requirements = requirements.filter(
        (req: Requirement) => req.status === params.status
      );
    }

    if (params.priority) {
      requirements = requirements.filter(
        (req: Requirement) => req.priority === params.priority
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
  }
);

// Tool: Get requirement by ID
server.tool(
  "requirements/get",
  {
    id: z.string(),
  },
  async (params) => {
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
  }
);

// Tool: Get requirement history
server.tool(
  "requirements/history",
  {
    id: z.string(),
  },
  async (params) => {
    await initializeStore();

    const updates = store.updates.filter(
      (update: RequirementUpdate) => update.requirementId === params.id
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
  }
);

// Tool: Add stakeholder
server.tool(
  "stakeholders/add",
  {
    name: z.string(),
    role: z.string(),
    contactInfo: z.string().optional(),
    requirements: z.array(z.string()).optional(),
  },
  async (params) => {
    await initializeStore();

    const stakeholder = store.addStakeholder({
      name: params.name,
      role: params.role,
      contactInfo: params.contactInfo,
      requirements: params.requirements || [],
    });

    await store.save();

    return {
      content: [
        {
          type: "text",
          text: `Stakeholder created successfully with ID: ${stakeholder.id}`,
        },
      ],
    };
  }
);

// Tool: Add project
server.tool(
  "projects/add",
  {
    name: z.string(),
    description: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    status: z
      .enum(["planning", "in-progress", "completed", "on-hold"])
      .optional(),
    requirements: z.array(z.string()).optional(),
    stakeholders: z.array(z.string()).optional(),
  },
  async (params) => {
    await initializeStore();

    const project = store.addProject({
      name: params.name,
      description: params.description,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status || "planning",
      requirements: params.requirements || [],
      stakeholders: params.stakeholders || [],
    });

    await store.save();

    return {
      content: [
        {
          type: "text",
          text: `Project created successfully with ID: ${project.id}`,
        },
      ],
    };
  }
);

// Add a welcome prompt that guides users on how to use the requirements gathering tools
server.prompt("welcome", {}, (args, extra) => {
  return {
    messages: [
      {
        role: "assistant",
        content: {
          type: "text",
          text: `# Requirements Gathering Assistant

This agent helps you gather, organize, and manage project requirements.

## Available Tools:

### Requirements
- \`requirements/add\`: Add a new requirement
- \`requirements/update\`: Update an existing requirement
- \`requirements/list\`: List requirements (can be filtered)
- \`requirements/get\`: Get details of a specific requirement
- \`requirements/history\`: View the history of changes to a requirement

### Stakeholders
- \`stakeholders/add\`: Add a new stakeholder

### Projects
- \`projects/add\`: Add a new project

## Example Usage:
Try adding a new requirement with: \`requirements/add\`
`,
        },
      },
    ],
  };
});

// Start the server
async function startServer() {
  try {
    // Use the stdio transport for command-line interaction
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Requirements Gathering MCP server started");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);
