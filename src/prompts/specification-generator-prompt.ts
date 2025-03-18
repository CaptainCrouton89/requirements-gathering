/**
 * Specification Generator Prompt for requirements-gatherer
 * 
 * This prompt helps generate the final specifications document
 * based on the gathered requirements.
 */
import Handlebars from 'handlebars';

/**
 * Interface for the prompt variables
 */
interface SpecificationGeneratorPromptVariables {
  projectName: string;
  projectType: string;
  projectDescription: string;
  functionalRequirements: any[];
  nonFunctionalRequirements: any[];
  constraints: any[];
  assumptions: any[];
  format: string;
  includeSections: string[];
}

/**
 * System prompt template for specification document generation
 */
const systemPromptTemplate = Handlebars.compile(`
You are an expert in creating software specification documents. Your task is to generate a comprehensive specification document for the project named "{{projectName}}" (type: {{projectType}}).

The project is described as: "{{projectDescription}}"

The following requirements have been gathered:

{{#if functionalRequirements.length}}
FUNCTIONAL REQUIREMENTS:
{{#each functionalRequirements}}
- {{this.question}}: {{this.answer}}
{{/each}}
{{/if}}

{{#if nonFunctionalRequirements.length}}
NON-FUNCTIONAL REQUIREMENTS:
{{#each nonFunctionalRequirements}}
- {{this.question}}: {{this.answer}}
{{/each}}
{{/if}}

{{#if constraints.length}}
CONSTRAINTS:
{{#each constraints}}
- {{this.question}}: {{this.answer}}
{{/each}}
{{/if}}

{{#if assumptions.length}}
ASSUMPTIONS:
{{#each assumptions}}
- {{this.question}}: {{this.answer}}
{{/each}}
{{/if}}

Please generate a {{format}} specification document that includes the following sections:
{{#each includeSections}}
- {{this}}
{{/each}}

The specification should:
1. Be comprehensive and well-structured
2. Use clear, precise language that both technical and non-technical stakeholders can understand
3. Organize requirements logically and reference them with unique identifiers
4. Include all relevant information from the gathered requirements
5. Fill in any obvious gaps or inconsistencies in a reasonable way
`);

/**
 * Compile the system prompt with the given variables
 */
export function getSystemPrompt(variables: SpecificationGeneratorPromptVariables): string {
  return systemPromptTemplate(variables).trim();
}

export default { getSystemPrompt }; 