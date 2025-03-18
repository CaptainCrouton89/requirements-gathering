/** * Example Prompt for
requirements-gatherer
* * This is a simple example prompt that demonstrates the basic structure * of
an MCP server prompt with variable interpolation. */ import Handlebars from
'handlebars'; /** * Interface for the prompt variables */

/** * System prompt template - instructions for the AI */ const
systemPromptTemplate = Handlebars.compile(` You are an assistant for
requirements-gatherer. Your role is to help users with their tasks. Always be
helpful, concise, and accurate in your responses.
`); /** * User prompt template - the actual query to the AI */ const
userPromptTemplate = Handlebars.compile(`
  Please help me with my request.
`); /** * Compile the system prompt with the given variables */ export function
getSystemPrompt()
{
  return systemPromptTemplate({}).trim();
} /** * Compile the user prompt with the given variables */ export function
getUserPrompt()
{
  return userPromptTemplate({}).trim();
} export default { getSystemPrompt, getUserPrompt };