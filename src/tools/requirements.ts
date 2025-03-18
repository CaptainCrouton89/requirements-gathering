import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createProject,
  createRequirement,
  deleteProject,
  deleteRequirement,
  updateProject,
  updateRequirement,
} from "../lib/storage.js";
import {
  RequirementPriority,
  RequirementStatus,
  RequirementType,
} from "../lib/types.js";

/**
 * Register all requirements-related tools with the MCP server
 */
export function registerRequirementsTools(server: McpServer) {
  // Create a new requirement
  server.tool(
    "create-requirement",
    {
      title: z.string().min(3).max(100),
      description: z.string().min(5),
      type: z.enum([
        RequirementType.FUNCTIONAL,
        RequirementType.NON_FUNCTIONAL,
        RequirementType.TECHNICAL,
        RequirementType.USER_STORY,
      ]),
      priority: z.enum([
        RequirementPriority.LOW,
        RequirementPriority.MEDIUM,
        RequirementPriority.HIGH,
        RequirementPriority.CRITICAL,
      ]),
      tags: z.array(z.string()).optional(),
    },
    async ({ title, description, type, priority, tags }) => {
      try {
        const requirement = await createRequirement({
          title,
          description,
          type,
          priority,
          tags,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(requirement, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating requirement: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Update an existing requirement
  server.tool(
    "update-requirement",
    {
      id: z.string().uuid(),
      title: z.string().min(3).max(100).optional(),
      description: z.string().min(5).optional(),
      type: z
        .enum([
          RequirementType.FUNCTIONAL,
          RequirementType.NON_FUNCTIONAL,
          RequirementType.TECHNICAL,
          RequirementType.USER_STORY,
        ])
        .optional(),
      priority: z
        .enum([
          RequirementPriority.LOW,
          RequirementPriority.MEDIUM,
          RequirementPriority.HIGH,
          RequirementPriority.CRITICAL,
        ])
        .optional(),
      status: z
        .enum([
          RequirementStatus.DRAFT,
          RequirementStatus.PROPOSED,
          RequirementStatus.APPROVED,
          RequirementStatus.REJECTED,
          RequirementStatus.IMPLEMENTED,
          RequirementStatus.VERIFIED,
        ])
        .optional(),
      tags: z.array(z.string()).optional(),
    },
    async (params) => {
      try {
        const { id, ...updates } = params;
        const requirement = await updateRequirement(id, updates);

        if (!requirement) {
          return {
            content: [
              {
                type: "text",
                text: `Requirement with ID ${id} not found`,
              },
            ],
            isError: true,
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
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating requirement: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Delete a requirement
  server.tool(
    "delete-requirement",
    {
      id: z.string().uuid(),
    },
    async ({ id }) => {
      try {
        const success = await deleteRequirement(id);

        if (!success) {
          return {
            content: [
              {
                type: "text",
                text: `Requirement with ID ${id} not found`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Requirement with ID ${id} successfully deleted`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting requirement: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create a new project
  server.tool(
    "create-project",
    {
      name: z.string().min(3).max(100),
      description: z.string().min(5),
    },
    async ({ name, description }) => {
      try {
        const project = await createProject({
          name,
          description,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating project: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Update an existing project
  server.tool(
    "update-project",
    {
      id: z.string().uuid(),
      name: z.string().min(3).max(100).optional(),
      description: z.string().min(5).optional(),
    },
    async (params) => {
      try {
        const { id, ...updates } = params;
        const project = await updateProject(id, updates);

        if (!project) {
          return {
            content: [
              {
                type: "text",
                text: `Project with ID ${id} not found`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating project: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Delete a project
  server.tool(
    "delete-project",
    {
      id: z.string().uuid(),
    },
    async ({ id }) => {
      try {
        const success = await deleteProject(id);

        if (!success) {
          return {
            content: [
              {
                type: "text",
                text: `Project with ID ${id} not found`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Project with ID ${id} successfully deleted`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting project: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Generate requirement from description
  server.tool(
    "generate-requirement",
    {
      description: z.string().min(10),
      projectId: z.string().uuid().optional(),
    },
    async ({ description, projectId }) => {
      try {
        // Simple heuristic to determine type based on keywords
        let type = RequirementType.FUNCTIONAL;
        if (
          description.toLowerCase().includes("performance") ||
          description.toLowerCase().includes("security") ||
          description.toLowerCase().includes("reliability") ||
          description.toLowerCase().includes("scalability")
        ) {
          type = RequirementType.NON_FUNCTIONAL;
        } else if (
          description.toLowerCase().includes("technology") ||
          description.toLowerCase().includes("database") ||
          description.toLowerCase().includes("architecture")
        ) {
          type = RequirementType.TECHNICAL;
        } else if (
          description.toLowerCase().includes("as a user") ||
          description.toLowerCase().includes("i want") ||
          description.toLowerCase().includes("so that")
        ) {
          type = RequirementType.USER_STORY;
        }

        // Extract relevant tags
        const potentialTags = [
          "security",
          "performance",
          "usability",
          "frontend",
          "backend",
          "database",
          "api",
          "authentication",
          "ui",
          "ux",
          "mobile",
          "desktop",
          "web",
          "testing",
          "documentation",
        ];

        const tags = potentialTags.filter((tag) =>
          description.toLowerCase().includes(tag.toLowerCase())
        );

        const title = description.split(".")[0].substring(0, 100);

        const requirement = await createRequirement({
          title,
          description,
          type,
          priority: RequirementPriority.MEDIUM,
          tags,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(requirement, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating requirement: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
