const { createServer } = require("@mcp/server");
const { createStorageProvider } = require("@mcp/storage");

// Import our tools
const requirementsGatherer = require("./src/tools/requirements_gatherer");

// Import our prompts
const requirementsGatheringPrompt = require("./src/prompts/requirements_gathering_prompt");

// Create an MCP server
const storage = createStorageProvider();
const server = createServer({
  name: "Requirements Gathering Tool",
  description:
    "An application that helps users gather requirements for their tasks through clarifying questions to build a detailed specifications document.",
  storage,
});

// Register our tools
server.registerTool(requirementsGatherer);

// Register our prompts
server.registerPrompt(requirementsGatheringPrompt);

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Requirements Gathering Tool is running on port ${port}`);
});
