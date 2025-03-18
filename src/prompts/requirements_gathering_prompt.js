const { definePrompt } = require("@mcp/server");

/**
 * This prompt guides the AI in gathering requirements through structured questions and follow-ups.
 */
module.exports = definePrompt({
  name: "requirements_gathering_prompt",
  description:
    "A prompt that guides the requirements gathering process through structured questions and follow-ups.",
  parameters: {
    initialMessage: {
      type: "string",
      description: "The initial message to the AI with basic task information.",
    },
    domainQuestions: {
      type: "array",
      description: "Domain-specific questions to ask the user.",
    },
    sessionId: {
      type: "string",
      description: "The ID of the current session.",
    },
  },
  systemPrompt: `
You are a skilled requirements analyst helping a user gather detailed requirements for their task.
Your goal is to help the user create a comprehensive and detailed specifications document.

Follow these steps:
1. Start by introducing yourself briefly and explaining the process.
2. Ask the initial domain-specific questions provided to you.
3. Listen carefully to the user's responses and ask appropriate follow-up questions.
4. Focus on uncovering:
   - Functional requirements (what the solution must do)
   - Non-functional requirements (how well the solution must perform)
   - Constraints (limitations or restrictions)
   - Assumptions (what is assumed to be true)
   - Dependencies (what the solution depends on)
   - Risks (potential issues that could affect the project)

5. After gathering sufficient information, summarize the requirements and ask if anything is missing.
6. Once the user confirms the requirements are complete, organize the information into a structured specification document.

Be thorough but efficient in your questioning. Avoid asking for information the user has already provided.
Be empathetic and professional in your interactions.
  `,
  userPrompt: `
{{initialMessage}}

I'll be asking you a series of questions to help gather detailed requirements. Let's start with these initial questions related to your domain:

{{#each domainQuestions}}
- {{this}}
{{/each}}

Feel free to provide as much or as little detail as you have at this stage. We can refine the information later.
  `,
  async execute(
    { initialMessage, domainQuestions, sessionId },
    { dialogueManager, storageProvider }
  ) {
    // Get the session
    const session = storageProvider.getSession(sessionId);

    // Create a new dialogue
    const dialogue = dialogueManager.createDialogue({
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
      parameters: {
        initialMessage,
        domainQuestions,
      },
    });

    // Start the dialogue
    await dialogue.start();

    // Get the dialogue messages
    const messages = await dialogue.getMessages();

    // Extract requirements from the dialogue
    const requirements = extractRequirements(messages);

    // Store the requirements in the session
    await session.set("requirements", requirements);

    return {
      requirements,
      dialogueId: dialogue.id,
    };
  },
});

/**
 * Extract structured requirements from dialogue messages
 */
function extractRequirements(messages) {
  // This function would use NLP or pattern matching to extract requirements from the dialogue
  // For now, we'll use a simplified approach

  const requirements = {
    title: "Requirements Specification Document",
    description:
      "This document outlines the requirements gathered through collaborative dialogue.",
    objectives: [],
    stakeholders: {},
    scope: "To be determined based on dialogue",
    timeline: "To be determined based on dialogue",
    budget: "To be determined based on dialogue",
    constraints: [],
    functional_requirements: [],
    non_functional_requirements: [],
    assumptions: [],
    risks: [],
    dependencies: [],
  };

  // Analyze messages to extract requirements
  // This would be more sophisticated in a real implementation
  messages.forEach((message) => {
    if (message.role === "user") {
      const text = message.content;

      // Extract objectives (very simplified)
      if (text.includes("goal") || text.includes("objective")) {
        const sentences = text.split(".");
        sentences.forEach((sentence) => {
          if (sentence.includes("goal") || sentence.includes("objective")) {
            requirements.objectives.push(sentence.trim());
          }
        });
      }

      // Extract stakeholders (very simplified)
      if (text.includes("stakeholder") || text.includes("user")) {
        const sentences = text.split(".");
        sentences.forEach((sentence) => {
          if (sentence.includes("stakeholder") || sentence.includes("user")) {
            requirements.stakeholders[
              `Stakeholder ${Object.keys(requirements.stakeholders).length + 1}`
            ] = sentence.trim();
          }
        });
      }

      // Extract constraints (very simplified)
      if (text.includes("constraint") || text.includes("limitation")) {
        const sentences = text.split(".");
        sentences.forEach((sentence) => {
          if (
            sentence.includes("constraint") ||
            sentence.includes("limitation")
          ) {
            requirements.constraints.push(sentence.trim());
          }
        });
      }

      // Extract functional requirements (very simplified)
      if (
        text.includes("should") ||
        text.includes("must") ||
        text.includes("need")
      ) {
        const sentences = text.split(".");
        sentences.forEach((sentence) => {
          if (
            (sentence.includes("should") ||
              sentence.includes("must") ||
              sentence.includes("need")) &&
            !sentence.includes("should not") &&
            !sentence.includes("must not")
          ) {
            requirements.functional_requirements.push({
              title: `Requirement ${
                requirements.functional_requirements.length + 1
              }`,
              description: sentence.trim(),
            });
          }
        });
      }
    }
  });

  return requirements;
}
