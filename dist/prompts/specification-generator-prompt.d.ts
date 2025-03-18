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
 * Compile the system prompt with the given variables
 */
export declare function getSystemPrompt(variables: SpecificationGeneratorPromptVariables): string;
declare const _default: {
    getSystemPrompt: typeof getSystemPrompt;
};
export default _default;
