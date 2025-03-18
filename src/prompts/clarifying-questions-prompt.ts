/**
 * Clarifying Questions Prompt for requirements-gatherer
 * 
 * This prompt helps generate appropriate clarifying questions
 * based on the current state of requirements gathering.
 */
import Handlebars from 'handlebars';

/**
 * Interface for the prompt variables
 */
interface ClarifyingQuestionsPromptVariables {
  projectName: string;
  projectType: string;
  projectDescription: string;
  currentStage: string;
  existingAnswers: Record<string, string>;
  requiredQuestionCount?: number;
}

/**
 * System prompt template for clarifying questions generation
 */
const systemPromptTemplate = Handlebars.compile(`
You are an expert requirements analyst. Your task is to generate clarifying questions for the project named "{{projectName}}" (type: {{projectType}}).

The project is described as: "{{projectDescription}}"

The current stage of requirements gathering is: "{{currentStage}}"

The following questions have already been answered:
{{#each existingAnswers}}
Q: {{@key}}
A: {{this}}
{{/each}}

Based on this information, generate {{requiredQuestionCount}} relevant clarifying questions that will help gather more detailed requirements.

The questions should:
1. Be specific and directly related to the project
2. Avoid duplicating information already provided
3. Focus on the aspects most relevant to the current stage
4. Help identify requirements, constraints, and assumptions
5. Be phrased clearly to avoid ambiguity
`);

/**
 * Compile the system prompt with the given variables
 */
export function getSystemPrompt(variables: ClarifyingQuestionsPromptVariables): string {
  // Set default number of questions if not provided
  const vars = {
    ...variables,
    requiredQuestionCount: variables.requiredQuestionCount || 5
  };
  
  return systemPromptTemplate(vars).trim();
}

export default { getSystemPrompt }; 