import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all requirements-related prompts with the MCP server
 */
export function registerRequirementsPrompts(server: McpServer) {
  // Prompt for generating a requirement based on a description
  server.prompt(
    "generate-requirement",
    {
      description: z.string().min(10),
    },
    ({ description }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
Please create a software requirement based on the following description:

${description}

For this requirement, please:
1. Determine if it's a functional, non-functional, technical requirement, or user story
2. Suggest an appropriate priority (low, medium, high, critical)
3. Identify relevant tags
4. Create a clear, concise title
5. Expand the description to be specific and testable
            `.trim(),
          },
        },
      ],
    })
  );

  // Prompt for analyzing existing requirements
  server.prompt(
    "analyze-requirements",
    {
      requirementsUri: z.string().startsWith("requirements://"),
    },
    ({ requirementsUri }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
Please analyze the following requirements data and provide insights:

1. Identify any gaps or missing requirements
2. Suggest improvements for unclear or ambiguous requirements
3. Highlight potential conflicts or dependencies between requirements
4. Recommend priority adjustments if needed
5. Suggest any additional requirements that might be needed

Requirements data can be found at: ${requirementsUri}
            `.trim(),
          },
        },
      ],
    })
  );

  // Prompt for creating a requirements document
  server.prompt(
    "create-requirements-document",
    {
      requirementsUri: z.string().startsWith("requirements://"),
      documentFormat: z
        .string()
        .refine((val) => val === "markdown" || val === "html", {
          message: "Document format must be 'markdown' or 'html'",
        }),
      includeMetadata: z
        .string()
        .refine((val) => val === "true" || val === "false", {
          message: "includeMetadata must be 'true' or 'false'",
        }),
    },
    ({
      requirementsUri,
      documentFormat,
      includeMetadata,
    }: {
      requirementsUri: string;
      documentFormat: string;
      includeMetadata: string;
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
Please create a formal requirements document in ${documentFormat} format based on the requirements data at: ${requirementsUri}

The document should:
1. Have a professional structure with sections and subsections
2. Group requirements logically by type and related functionality
3. Include a table of contents
${
  includeMetadata === "true"
    ? "4. Include metadata such as status, priority, and tags for each requirement"
    : ""
}
5. Be formatted for readability and professional presentation

Please organize the requirements in a way that would make sense to both technical and non-technical stakeholders.
            `.trim(),
          },
        },
      ],
    })
  );

  // Prompt for requirements validation
  server.prompt(
    "validate-requirements",
    {
      requirementsUri: z.string().startsWith("requirements://"),
      validationCriteria: z.string().optional(),
    },
    ({
      requirementsUri,
      validationCriteria,
    }: {
      requirementsUri: string;
      validationCriteria?: string;
    }) => {
      const defaultCriteria = [
        "Clear and unambiguous",
        "Testable and verifiable",
        "Consistent (no contradictions)",
        "Feasible and realistic",
        "Necessary (not redundant)",
        "Complete (no missing details)",
      ];

      // Parse the validation criteria if provided, otherwise use defaults
      const criteriaArray = validationCriteria
        ? (JSON.parse(validationCriteria) as string[])
        : defaultCriteria;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `
Please validate the requirements found at: ${requirementsUri}

For each requirement, evaluate it against these criteria:
${criteriaArray
  .map((criterion, index) => `${index + 1}. ${criterion}`)
  .join("\n")}

For any requirement that fails to meet these criteria:
- Identify which criteria it fails to satisfy
- Explain why it fails
- Suggest specific improvements to address the issues

Please be thorough and specific in your analysis.
              `.trim(),
            },
          },
        ],
      };
    }
  );

  // Prompt for generating test cases from requirements
  server.prompt(
    "generate-test-cases",
    {
      requirementUri: z.string().startsWith("requirements://"),
      testLevel: z
        .string()
        .refine(
          (val) =>
            ["unit", "integration", "system", "acceptance"].includes(val),
          {
            message:
              "Test level must be one of: unit, integration, system, acceptance",
          }
        ),
    },
    ({
      requirementUri,
      testLevel,
    }: {
      requirementUri: string;
      testLevel: string;
    }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
Please generate ${testLevel} test cases for the requirement found at: ${requirementUri}

For each test case, include:
1. A descriptive title
2. Preconditions/setup
3. Test steps with expected results
4. Pass/fail criteria
5. Any special considerations or edge cases to test

The test cases should thoroughly verify that the requirement is properly implemented.
            `.trim(),
          },
        },
      ],
    })
  );

  // Prompt for comparative analysis of requirements
  server.prompt(
    "compare-requirements",
    {
      requirementUri1: z.string().startsWith("requirements://"),
      requirementUri2: z.string().startsWith("requirements://"),
    },
    ({ requirementUri1, requirementUri2 }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `
Please compare the following two requirements:
- Requirement 1: ${requirementUri1}
- Requirement 2: ${requirementUri2}

In your analysis, please:
1. Identify similarities between the requirements
2. Highlight any differences or contradictions
3. Assess if there are any dependencies between them
4. Determine if they might be redundant or could be merged
5. Suggest any improvements to clarify the relationship between these requirements

Please be specific and reference details from both requirements in your analysis.
            `.trim(),
          },
        },
      ],
    })
  );

  // Prompt for guiding the requirements discovery process with follow-up questions
  server.prompt(
    "guided-discovery-followup",
    {
      stage: z.string(),
      domain: z.string(),
      currentResponse: z.string(),
      previousResponses: z.string().optional(),
    },
    ({
      stage,
      domain,
      currentResponse,
      previousResponses,
    }: {
      stage: string;
      domain: string;
      currentResponse: string;
      previousResponses?: string;
    }) => {
      // Parse previous responses if they exist
      let parsedPreviousResponses = {};
      if (previousResponses) {
        try {
          parsedPreviousResponses = JSON.parse(previousResponses);
        } catch (e) {
          // If parsing fails, use empty object
          parsedPreviousResponses = {};
        }
      }

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `
You are a requirements engineering expert guiding a discovery session for a ${domain} project. 
The current stage of the discovery process is: ${stage}

The user has just provided the following response:
"""
${currentResponse}
"""

Previous responses from earlier stages:
"""
${JSON.stringify(parsedPreviousResponses, null, 2)}
"""

Based on this information:
1. Identify any gaps, ambiguities, or areas that need more clarification in the current response
2. Generate 2-3 targeted follow-up questions to deepen the requirements discovery
3. Suggest any aspects of ${domain} that the user might have overlooked
4. Provide a brief summary of what you've learned from their response

Keep your tone conversational, focus on uncovering detailed, specific requirements, and help the user think more deeply about their needs.
`,
            },
          },
        ],
      };
    }
  );

  // Prompt for generating requirements from discovery responses
  server.prompt(
    "generate-requirements-from-discovery",
    {
      discoveryResponses: z.string(),
      domain: z.string(),
    },
    ({
      discoveryResponses,
      domain,
    }: {
      discoveryResponses: string;
      domain: string;
    }) => {
      // Parse discovery responses
      let parsedResponses = {};
      try {
        parsedResponses = JSON.parse(discoveryResponses);
      } catch (e) {
        // If parsing fails, use empty object
        parsedResponses = {};
      }

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `
You are a requirements engineering expert tasked with generating formal requirements from a discovery session for a ${domain} project.

The user has gone through a guided discovery process and provided the following information:
"""
${JSON.stringify(parsedResponses, null, 2)}
"""

Please analyze this information and generate the following types of requirements:
1. Functional Requirements: What the system must do
2. Non-Functional Requirements: Performance, security, usability, etc.
3. Technical Requirements: Specific technical constraints or needs
4. User Stories: In the format "As a [role], I want [goal] so that [benefit]"

For each requirement, include:
- A clear, concise title
- A detailed description that is specific and testable
- The appropriate type (functional, non-functional, technical, user story)
- A suggested priority (low, medium, high, critical)
- Relevant tags

Format the requirements as a valid JSON array of requirement objects.
Ensure each requirement is:
- Unambiguous and specific
- Testable/verifiable
- Feasible
- Consistent with other requirements
- Written in clear language

Aim to generate 5-10 comprehensive requirements that capture the essence of what the user needs.
`,
            },
          },
        ],
      };
    }
  );
}
