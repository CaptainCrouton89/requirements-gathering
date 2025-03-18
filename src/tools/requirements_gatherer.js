const { defineSchema } = require("@mcp/server");

/**
 * A tool that helps users gather requirements for their tasks through clarifying questions to build a detailed specifications document.
 */
module.exports = {
  name: "requirements_gatherer",
  description:
    "A tool that helps users gather requirements for their tasks through clarifying questions to build a detailed specifications document.",
  parameters: defineSchema({
    type: "object",
    required: ["task_description", "domain"],
    properties: {
      task_description: {
        type: "string",
        description:
          "Initial description of the task or project for which requirements need to be gathered.",
      },
      domain: {
        type: "string",
        description:
          "The domain or field of the task (e.g., software development, marketing, design, research).",
      },
      output_format: {
        type: "string",
        description:
          "The desired format for the output specification document (e.g., markdown, structured JSON, PDF).",
      },
    },
  }),
  async execute(
    { task_description, domain, output_format = "markdown" },
    { promptManager, storageProvider }
  ) {
    // Get the requirements gathering prompt
    const prompt = await promptManager.getPrompt(
      "requirements_gathering_prompt"
    );

    // Initial set of questions based on domain
    const domainQuestions = getDomainSpecificQuestions(domain);

    // Initial message to the AI
    const initialMessage = `I need to gather requirements for a task in the ${domain} domain. The initial description is: "${task_description}"`;

    // Create a new session for this requirements gathering
    const session = await storageProvider.createSession();

    // Store initial information
    await session.set("domain", domain);
    await session.set("task_description", task_description);
    await session.set("output_format", output_format);

    // Execute the requirements gathering prompt with initial information
    const result = await prompt.execute({
      initialMessage,
      domainQuestions,
      sessionId: session.id,
    });

    // Format the output according to the requested format
    const formattedOutput = formatOutput(result.requirements, output_format);

    return {
      specification_document: formattedOutput,
      session_id: session.id,
    };
  },
};

/**
 * Get domain-specific initial questions
 */
function getDomainSpecificQuestions(domain) {
  const generalQuestions = [
    "What is the primary goal or objective of this task?",
    "Who are the primary stakeholders or users?",
    "What is the expected timeline for this task?",
    "Are there any budget constraints?",
    "What metrics will be used to measure success?",
  ];

  const domainSpecificQuestions = {
    "software development": [
      "What platforms or devices need to be supported?",
      "Are there any specific technical constraints or requirements?",
      "What are the performance expectations?",
      "Are there any security requirements?",
      "What are the integration requirements with other systems?",
    ],
    marketing: [
      "Who is the target audience?",
      "What is the key message you want to communicate?",
      "What channels will be used for distribution?",
      "What are the brand guidelines?",
      "What are the expected conversion metrics?",
    ],
    design: [
      "What are the brand guidelines and visual identity requirements?",
      "Who is the target audience for this design?",
      "Are there any accessibility requirements?",
      "What specific deliverables are expected?",
      "Are there examples of designs you like or dislike?",
    ],
    research: [
      "What are the primary research questions?",
      "What methodology do you prefer or expect?",
      "What is the sample size or scope of the research?",
      "How will the research findings be used?",
      "Are there any ethical considerations or limitations?",
    ],
  };

  // Default to general questions if the domain is not specifically supported
  return [
    ...generalQuestions,
    ...(domainSpecificQuestions[domain.toLowerCase()] || []),
  ];
}

/**
 * Format the output according to the requested format
 */
function formatOutput(requirements, format) {
  switch (format.toLowerCase()) {
    case "json":
      return JSON.stringify(requirements, null, 2);
    case "pdf":
      // This would need PDF generation logic or return a token to generate one
      return `PDF generation would happen here with requirements: ${JSON.stringify(
        requirements
      )}`;
    case "markdown":
    default:
      return generateMarkdownOutput(requirements);
  }
}

/**
 * Generate a markdown formatted output
 */
function generateMarkdownOutput(requirements) {
  const {
    title,
    description,
    objectives,
    stakeholders,
    scope,
    timeline,
    budget,
    constraints,
    functional_requirements,
    non_functional_requirements,
    assumptions,
    risks,
    dependencies,
  } = requirements;

  let markdown = `# ${title}\n\n`;

  markdown += `## Project Overview\n\n${description}\n\n`;

  markdown += `## Objectives\n\n`;
  if (Array.isArray(objectives)) {
    objectives.forEach((objective) => {
      markdown += `- ${objective}\n`;
    });
  } else {
    markdown += objectives;
  }
  markdown += "\n\n";

  markdown += `## Stakeholders\n\n`;
  if (typeof stakeholders === "object" && stakeholders !== null) {
    Object.entries(stakeholders).forEach(([role, description]) => {
      markdown += `- **${role}**: ${description}\n`;
    });
  } else if (Array.isArray(stakeholders)) {
    stakeholders.forEach((stakeholder) => {
      markdown += `- ${stakeholder}\n`;
    });
  } else {
    markdown += stakeholders;
  }
  markdown += "\n\n";

  markdown += `## Scope\n\n${scope}\n\n`;

  markdown += `## Timeline\n\n${timeline}\n\n`;

  markdown += `## Budget\n\n${budget}\n\n`;

  markdown += `## Constraints and Limitations\n\n`;
  if (Array.isArray(constraints)) {
    constraints.forEach((constraint) => {
      markdown += `- ${constraint}\n`;
    });
  } else {
    markdown += constraints;
  }
  markdown += "\n\n";

  markdown += `## Functional Requirements\n\n`;
  if (Array.isArray(functional_requirements)) {
    functional_requirements.forEach((req, index) => {
      if (typeof req === "object") {
        markdown += `### ${req.title || `Requirement ${index + 1}`}\n\n`;
        markdown += `${req.description}\n\n`;
        if (req.acceptance_criteria) {
          markdown += `**Acceptance Criteria:**\n\n`;
          if (Array.isArray(req.acceptance_criteria)) {
            req.acceptance_criteria.forEach((criteria) => {
              markdown += `- ${criteria}\n`;
            });
          } else {
            markdown += req.acceptance_criteria;
          }
          markdown += "\n\n";
        }
      } else {
        markdown += `- ${req}\n`;
      }
    });
  } else {
    markdown += functional_requirements;
  }
  markdown += "\n\n";

  markdown += `## Non-functional Requirements\n\n`;
  if (Array.isArray(non_functional_requirements)) {
    non_functional_requirements.forEach((req) => {
      markdown += `- ${req}\n`;
    });
  } else {
    markdown += non_functional_requirements;
  }
  markdown += "\n\n";

  if (assumptions) {
    markdown += `## Assumptions\n\n`;
    if (Array.isArray(assumptions)) {
      assumptions.forEach((assumption) => {
        markdown += `- ${assumption}\n`;
      });
    } else {
      markdown += assumptions;
    }
    markdown += "\n\n";
  }

  if (risks) {
    markdown += `## Risks\n\n`;
    if (Array.isArray(risks)) {
      risks.forEach((risk) => {
        if (typeof risk === "object") {
          markdown += `### ${risk.title || "Risk"}\n\n`;
          markdown += `**Description:** ${risk.description}\n\n`;
          markdown += `**Impact:** ${risk.impact}\n\n`;
          markdown += `**Mitigation:** ${risk.mitigation}\n\n`;
        } else {
          markdown += `- ${risk}\n`;
        }
      });
    } else {
      markdown += risks;
    }
    markdown += "\n\n";
  }

  if (dependencies) {
    markdown += `## Dependencies\n\n`;
    if (Array.isArray(dependencies)) {
      dependencies.forEach((dependency) => {
        markdown += `- ${dependency}\n`;
      });
    } else {
      markdown += dependencies;
    }
    markdown += "\n\n";
  }

  markdown += `## Sign-off\n\n`;
  markdown += `| Role | Name | Signature | Date |\n`;
  markdown += `| --- | --- | --- | --- |\n`;
  markdown += `| Project Manager | | | |\n`;
  markdown += `| Client | | | |\n`;
  markdown += `| Developer Lead | | | |\n`;

  return markdown;
}
