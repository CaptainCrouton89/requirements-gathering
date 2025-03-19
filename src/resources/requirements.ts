import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { getProjects, getRequirements } from "../lib/storage-factory.js";

/**
 * Register all requirements-related resources with the MCP server
 */
export function registerRequirementsResources(server: McpServer) {
  // List all requirements
  server.resource("requirements-list", "requirements://list", async (uri) => {
    try {
      const requirements = await getRequirements();

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(requirements, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching requirements: ${error}`,
          },
        ],
      };
    }
  });

  // Get a specific requirement by ID
  server.resource(
    "requirement-detail",
    new ResourceTemplate("requirements://{id}", { list: undefined }),
    async (uri, { id }) => {
      try {
        const requirements = await getRequirements();
        const requirement = requirements.find((req) => req.id === id);

        if (!requirement) {
          return {
            contents: [
              {
                uri: uri.href,
                text: `Requirement with ID ${id} not found`,
              },
            ],
          };
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(requirement, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching requirement: ${error}`,
            },
          ],
        };
      }
    }
  );

  // Get requirements filtered by type
  server.resource(
    "requirements-by-type",
    new ResourceTemplate("requirements://type/{type}", { list: undefined }),
    async (uri, { type }) => {
      try {
        const requirements = await getRequirements();
        const filteredRequirements = requirements.filter(
          (req) => req.type === type
        );

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(filteredRequirements, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching requirements by type: ${error}`,
            },
          ],
        };
      }
    }
  );

  // Get requirements filtered by status
  server.resource(
    "requirements-by-status",
    new ResourceTemplate("requirements://status/{status}", { list: undefined }),
    async (uri, { status }) => {
      try {
        const requirements = await getRequirements();
        const filteredRequirements = requirements.filter(
          (req) => req.status === status
        );

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(filteredRequirements, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching requirements by status: ${error}`,
            },
          ],
        };
      }
    }
  );

  // Get requirements filtered by priority
  server.resource(
    "requirements-by-priority",
    new ResourceTemplate("requirements://priority/{priority}", {
      list: undefined,
    }),
    async (uri, { priority }) => {
      try {
        const requirements = await getRequirements();
        const filteredRequirements = requirements.filter(
          (req) => req.priority === priority
        );

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(filteredRequirements, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching requirements by priority: ${error}`,
            },
          ],
        };
      }
    }
  );

  // Get requirements filtered by project ID
  server.resource(
    "requirements-by-project",
    new ResourceTemplate("requirements://project/{projectId}", {
      list: undefined,
    }),
    async (uri, { projectId }) => {
      try {
        const requirements = await getRequirements();
        const filteredRequirements = requirements.filter(
          (req) => req.projectId === projectId
        );

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(filteredRequirements, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching requirements by project: ${error}`,
            },
          ],
        };
      }
    }
  );

  // Get requirements filtered by tag
  server.resource(
    "requirements-by-tag",
    new ResourceTemplate("requirements://tag/{tag}", { list: undefined }),
    async (uri, { tag }) => {
      try {
        const requirements = await getRequirements();
        const filteredRequirements = requirements.filter(
          (req) => Array.isArray(req.tags) && req.tags.includes(tag as string)
        );

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(filteredRequirements, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching requirements by tag: ${error}`,
            },
          ],
        };
      }
    }
  );

  // List all projects
  server.resource("projects-list", "projects://list", async (uri) => {
    try {
      const projects = await getProjects();

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching projects: ${error}`,
          },
        ],
      };
    }
  });

  // Get a specific project by ID
  server.resource(
    "project-detail",
    new ResourceTemplate("projects://{id}", { list: undefined }),
    async (uri, { id }) => {
      try {
        const projects = await getProjects();
        const project = projects.find((proj) => proj.id === id);

        if (!project) {
          return {
            contents: [
              {
                uri: uri.href,
                text: `Project with ID ${id} not found`,
              },
            ],
          };
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(project, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching project: ${error}`,
            },
          ],
        };
      }
    }
  );

  // Requirements summary with statistics
  server.resource(
    "requirements-summary",
    "requirements://summary",
    async (uri) => {
      try {
        const requirements = await getRequirements();

        // Count by type
        const typeStats = requirements.reduce((acc, req) => {
          acc[req.type] = (acc[req.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Count by status
        const statusStats = requirements.reduce((acc, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Count by priority
        const priorityStats = requirements.reduce((acc, req) => {
          acc[req.priority] = (acc[req.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Gather all tags and count occurrences
        const tagCounts = requirements.reduce((acc, req) => {
          if (Array.isArray(req.tags)) {
            req.tags.forEach((tag) => {
              acc[tag] = (acc[tag] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<string, number>);

        const summary = {
          totalRequirements: requirements.length,
          byType: typeStats,
          byStatus: statusStats,
          byPriority: priorityStats,
          topTags: Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .reduce((acc, [tag, count]) => {
              acc[tag] = count;
              return acc;
            }, {} as Record<string, number>),
        };

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error generating requirements summary: ${error}`,
            },
          ],
        };
      }
    }
  );
}
