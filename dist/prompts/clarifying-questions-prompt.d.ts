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
 * Compile the system prompt with the given variables
 */
export declare function getSystemPrompt(variables: ClarifyingQuestionsPromptVariables): string;
declare const _default: {
    getSystemPrompt: typeof getSystemPrompt;
};
export default _default;
