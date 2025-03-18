import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tools and resources
import { registerRequirementsPrompts } from "./prompts/requirements.js";
import { registerRequirementsResources } from "./resources/requirements.js";
import { registerRequirementsTools } from "./tools/requirements.js";

// Create the MCP server
const server = new McpServer({
  name: "requirements-gathering",
  version: "1.0.0",
  description: "An MCP server for gathering and managing project requirements",
});

// Register all tools, resources, and prompts
registerRequirementsTools(server);
registerRequirementsResources(server);
registerRequirementsPrompts(server);

// Start the server with stdio transport
async function main() {
  console.error("Starting MCP Requirements Gathering Server...");

  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server connected via stdio transport");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

main();
