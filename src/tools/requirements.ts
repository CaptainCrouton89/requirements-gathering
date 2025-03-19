import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createProject,
  createRequirement,
  deleteProject,
  deleteRequirement,
  findProjectsByName,
  getProjectById,
  getRequirementsByProject,
  updateProject,
  updateRequirement,
} from "../lib/storage-factory.js";
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
    "This tool is used to create a new requirement for a project.",
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
      projectId: z.string().uuid(),
      tags: z.array(z.string()).optional(),
    },
    async ({ title, description, type, priority, projectId, tags }) => {
      try {
        const requirement = await createRequirement({
          title,
          description,
          type,
          priority,
          projectId,
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

  // Guided requirement discovery tool
  server.tool(
    "guided-requirement-discovery",
    "This tool is used to guide the user through the process of discovering requirements for a project.",
    {
      projectId: z.string().uuid(),
      domain: z.string().min(3),
      stage: z
        .enum([
          "initial",
          "stakeholders",
          "features",
          "constraints",
          "quality",
          "finalize",
        ])
        .optional(),
      context: z.string().optional(),
      previousResponses: z.string().optional(),
    },
    async ({
      projectId,
      domain,
      stage = "initial",
      context = "",
      previousResponses = "",
    }) => {
      try {
        // Parse previous responses if provided
        let responses = {};
        if (previousResponses) {
          try {
            responses = JSON.parse(previousResponses);
          } catch (e) {
            // If parsing fails, start with empty responses
            responses = {};
          }
        }

        // Define questions and guidance for each stage
        const stages = {
          initial: {
            title: "Project Context",
            description:
              "Let's start by understanding the basic context of your project.",
            questions: [
              "What problem is this project trying to solve?",
              "Who are the primary users or customers?",
              "What are the main goals or objectives of this project?",
              "Are there any existing systems this will replace or integrate with?",
            ],
          },
          stakeholders: {
            title: "Stakeholder Needs",
            description: "Let's identify the key stakeholders and their needs.",
            questions: [
              "Who are all the stakeholders involved in this project?",
              "What are their primary concerns or interests?",
              "Are there conflicting needs between different stakeholders?",
              "Who will be using the system most frequently?",
            ],
          },
          features: {
            title: "Core Functionality",
            description:
              "Now, let's explore the main features and functionality needed.",
            questions: [
              "What are the most critical features this solution must have?",
              "What actions should users be able to perform?",
              "What data needs to be stored or processed?",
              "Are there any specific workflows that need to be supported?",
            ],
          },
          constraints: {
            title: "Constraints and Limitations",
            description:
              "Let's identify any constraints or limitations for the project.",
            questions: [
              "Are there any technical constraints or limitations?",
              "What are the budget or resource constraints?",
              "Are there any regulatory or compliance requirements?",
              "What is the timeline for implementation?",
            ],
          },
          quality: {
            title: "Quality Attributes",
            description:
              "Let's discuss the non-functional requirements and quality attributes.",
            questions: [
              "What performance requirements are important (speed, throughput, etc.)?",
              "What security and privacy requirements are needed?",
              "How important is scalability for future growth?",
              "What level of reliability and availability is required?",
            ],
          },
          finalize: {
            title: "Requirement Finalization",
            description:
              "Let's review and finalize the requirements based on all the information provided.",
            questions: [
              "Based on our discussion, I can now suggest specific requirements. Would you like to review them?",
              "Are there any areas we've discussed that need more clarification?",
              "Should we prioritize these requirements in a specific way?",
              "Are there any assumptions we should document alongside these requirements?",
            ],
          },
        };

        // Get the current stage information
        const currentStage = stages[stage];

        // Combine context with questions for the current stage
        const message = {
          title: currentStage.title,
          description: currentStage.description,
          questions: currentStage.questions,
          domain: domain,
          context: context,
          previousResponses: responses,
          nextStage: getNextStage(stage),
          projectId: projectId,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(message, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error in guided requirement discovery: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Helper function to determine the next stage
  function getNextStage(currentStage: string): string {
    const stageOrder = [
      "initial",
      "stakeholders",
      "features",
      "constraints",
      "quality",
      "finalize",
    ];
    const currentIndex = stageOrder.indexOf(currentStage);
    return currentIndex < stageOrder.length - 1
      ? stageOrder[currentIndex + 1]
      : "complete";
  }

  // Update an existing requirement
  server.tool(
    "update-requirement",
    "This tool is used to update an existing requirement.",
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
      projectId: z.string().uuid(),
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
    "This tool is used to delete an existing requirement.",
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
    "This tool is used to create a new project. When the user wants to figure out requirements for a new project, this tool should be used first to create the project.",
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
    "This tool is used to update an existing project.",
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
    "This tool is used to delete an existing project along with all its associated requirements. This operation cannot be undone.",
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
              text: `Project with ID ${id} and all its requirements successfully deleted`,
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
    "This tool is used to generate a new requirement from a description.",
    {
      description: z.string().min(10),
      projectId: z.string().uuid(),
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
          projectId,
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

  // Get requirements by project
  server.tool(
    "list-project-requirements",
    "This tool is used to list all requirements for a project.",
    {
      projectId: z.string().uuid(),
    },
    async ({ projectId }) => {
      try {
        const requirements = await getRequirementsByProject(projectId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(requirements, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing project requirements: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Generate requirements from discovery process
  server.tool(
    "generate-requirements-from-discovery",
    "This tool is used to generate requirements from a discovery process.",
    {
      discoveryResponses: z.string(),
      projectId: z.string().uuid(),
    },
    async ({ discoveryResponses, projectId }) => {
      try {
        // Parse the discovery responses
        let responses: Record<string, string> = {};
        try {
          responses = JSON.parse(discoveryResponses) as Record<string, string>;
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: `Error parsing discovery responses: ${e}`,
              },
            ],
            isError: true,
          };
        }

        // Extract information from responses to generate requirements
        const extractedRequirements =
          extractRequirementsFromDiscovery(responses);

        // Create the actual requirements in the system
        const createdRequirements: any[] = [];
        for (const reqData of extractedRequirements) {
          const requirement = await createRequirement({
            title: reqData.title,
            description: reqData.description,
            type: reqData.type,
            priority: reqData.priority,
            projectId: projectId,
            tags: reqData.tags,
          });

          createdRequirements.push(requirement);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  message: `Successfully created ${createdRequirements.length} requirements`,
                  requirements: createdRequirements,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating requirements from discovery: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Process a discovery response and provide follow-up questions
  server.tool(
    "process-discovery-response",
    "This tool is used to process a requirements discovery response and provide follow-up questions.",
    {
      stage: z.string(),
      domain: z.string().min(3),
      response: z.string().min(1),
      previousResponses: z.string().optional(),
      projectId: z.string().uuid(),
    },
    async ({ stage, domain, response, previousResponses, projectId }) => {
      try {
        // Update the responses object with the current response
        let responses: Record<string, string> = {};
        if (previousResponses) {
          try {
            responses = JSON.parse(previousResponses) as Record<string, string>;
          } catch (e) {
            // If parsing fails, start with empty responses
            responses = {};
          }
        }

        // Add the current response to the appropriate stage
        responses[stage] = response;

        // Get the next stage
        const nextStage = getNextStage(stage);

        // If we've reached the end of the process, generate requirements
        if (nextStage === "complete") {
          // Call the function to extract and create requirements
          const extractedRequirements =
            extractRequirementsFromDiscovery(responses);

          // Create the actual requirements in the system
          const createdRequirements: any[] = [];
          for (const reqData of extractedRequirements) {
            const requirement = await createRequirement({
              title: reqData.title,
              description: reqData.description,
              type: reqData.type,
              priority: reqData.priority,
              projectId: projectId,
              tags: reqData.tags,
            });

            createdRequirements.push(requirement);
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "complete",
                    message: `Discovery process complete! Created ${createdRequirements.length} requirements.`,
                    requirements: createdRequirements,
                    responses: responses,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } else {
          // Get LLM to generate follow-up questions based on the current response
          // Structure a message to invoke the guided-discovery-followup prompt
          const promptResponse = {
            status: "in_progress",
            nextStage: nextStage,
            responses: responses,
            updatedResponses: JSON.stringify(responses),
            promptToInvoke: "guided-discovery-followup",
            promptParams: {
              stage: stage,
              domain: domain,
              currentResponse: response,
              previousResponses: JSON.stringify(responses),
              projectId: projectId,
            },
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(promptResponse, null, 2),
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error processing discovery response: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Helper function to extract requirements from discovery responses
  function extractRequirementsFromDiscovery(
    responses: Record<string, string>
  ): {
    title: string;
    description: string;
    type: RequirementType;
    priority: RequirementPriority;
    tags: string[];
  }[] {
    const requirements = [];

    // Functional requirements from features
    if (responses.features) {
      // Extract key features mentioned
      const features = responses.features.split(/[.,;]/).filter(Boolean);
      for (const feature of features) {
        if (feature.trim().length > 10) {
          requirements.push({
            title: `Feature: ${feature.trim().substring(0, 50)}`,
            description: `The system shall provide: ${feature.trim()}`,
            type: RequirementType.FUNCTIONAL,
            priority: RequirementPriority.MEDIUM,
            tags: extractTags(feature),
          });
        }
      }
    }

    // Non-functional requirements from quality
    if (responses.quality) {
      const qualityText = responses.quality;
      // Look for performance requirements
      if (qualityText.match(/performance|speed|fast|responsive/i)) {
        requirements.push({
          title: "Performance Requirements",
          description: `The system must meet performance criteria as described: ${extractSentences(
            qualityText,
            /performance|speed|fast|responsive/i
          )}`,
          type: RequirementType.NON_FUNCTIONAL,
          priority: RequirementPriority.HIGH,
          tags: ["performance"],
        });
      }

      // Look for security requirements
      if (qualityText.match(/security|secure|protect|privacy/i)) {
        requirements.push({
          title: "Security Requirements",
          description: `The system must meet security requirements as described: ${extractSentences(
            qualityText,
            /security|secure|protect|privacy/i
          )}`,
          type: RequirementType.NON_FUNCTIONAL,
          priority: RequirementPriority.CRITICAL,
          tags: ["security"],
        });
      }

      // Look for scalability requirements
      if (qualityText.match(/scalability|scale|growth/i)) {
        requirements.push({
          title: "Scalability Requirements",
          description: `The system must meet scalability requirements as described: ${extractSentences(
            qualityText,
            /scalability|scale|growth/i
          )}`,
          type: RequirementType.NON_FUNCTIONAL,
          priority: RequirementPriority.MEDIUM,
          tags: ["scalability"],
        });
      }
    }

    // Technical requirements from constraints
    if (responses.constraints) {
      const constraintsText = responses.constraints;

      // Look for technical constraints
      if (
        constraintsText.match(/technical|technology|platform|architecture/i)
      ) {
        requirements.push({
          title: "Technical Constraints",
          description: `The system must adhere to the following technical constraints: ${extractSentences(
            constraintsText,
            /technical|technology|platform|architecture/i
          )}`,
          type: RequirementType.TECHNICAL,
          priority: RequirementPriority.HIGH,
          tags: ["technical", "constraint"],
        });
      }

      // Look for regulatory constraints
      if (constraintsText.match(/regulatory|compliance|legal|regulation/i)) {
        requirements.push({
          title: "Regulatory Compliance",
          description: `The system must comply with the following regulations: ${extractSentences(
            constraintsText,
            /regulatory|compliance|legal|regulation/i
          )}`,
          type: RequirementType.TECHNICAL,
          priority: RequirementPriority.CRITICAL,
          tags: ["compliance", "regulatory"],
        });
      }
    }

    // Create user stories from stakeholders
    if (responses.stakeholders && responses.initial) {
      const stakeholders = responses.stakeholders
        .split(/[.,;]/)
        .filter(Boolean);
      const goals = responses.initial.split(/[.,;]/).filter(Boolean);

      for (let i = 0; i < Math.min(stakeholders.length, 3); i++) {
        const stakeholder = stakeholders[i].trim();
        if (stakeholder.length > 5) {
          for (let j = 0; j < Math.min(goals.length, 2); j++) {
            const goal = goals[j].trim();
            if (goal.length > 10) {
              requirements.push({
                title: `As a ${stakeholder.substring(
                  0,
                  20
                )}, I want to ${goal.substring(0, 30)}`,
                description: `As a ${stakeholder}, I want to ${goal} so that I can achieve my objectives with the system.`,
                type: RequirementType.USER_STORY,
                priority: RequirementPriority.MEDIUM,
                tags: ["user-story"],
              });
            }
          }
        }
      }
    }

    return requirements;
  }

  // Helper function to extract tags from text
  function extractTags(text: string): string[] {
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

    return potentialTags.filter((tag) =>
      text.toLowerCase().includes(tag.toLowerCase())
    );
  }

  // Helper function to extract sentences containing specific keywords
  function extractSentences(text: string, pattern: RegExp): string {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const relevantSentences = sentences.filter((sentence) =>
      pattern.test(sentence)
    );

    return relevantSentences.join(". ");
  }

  // Find projects by name
  server.tool(
    "find-projects",
    "This tool is used to find projects by name. Returns all projects if no search term is provided.",
    {
      searchTerm: z.string().optional(),
    },
    async ({ searchTerm = "" }) => {
      try {
        const projects = await findProjectsByName(searchTerm);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: projects.length,
                  projects: projects,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error finding projects: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get a project by ID
  server.tool(
    "get-project",
    "This tool is used to retrieve a project by its ID.",
    {
      id: z.string().uuid(),
    },
    async ({ id }) => {
      try {
        const project = await getProjectById(id);

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
              text: `Error getting project: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
