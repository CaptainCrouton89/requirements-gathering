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
}
