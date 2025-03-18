/**
 * Interface for the system prompt variables
 */
interface SystemPromptVariables {
    projectName?: string;
    projectType?: string;
}
/**
 * Compile the system prompt with the given variables
 */
export declare function getSystemPrompt(variables?: SystemPromptVariables): string;
declare const _default: {
    getSystemPrompt: typeof getSystemPrompt;
};
export default _default;
