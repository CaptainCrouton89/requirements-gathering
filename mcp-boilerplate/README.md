#
requirements-gatherer

A requirements gathering application that asks clarifying questions to help users build detailed specifications documents

## Overview This is an MCP (Modular Compositional Personalization) server that
provides API endpoints for tools, resources, and prompts
to enable AI applications to access and use them. ## Getting Started ###
Prerequisites - Node.js (v18 or later) - npm, yarn, or pnpm ### Installation
```bash # Install dependencies npm install # or yarn install # or pnpm install
``` ### Development ```bash # Start the development server with hot-reloading
npm run dev # or yarn dev # or pnpm dev ``` The server will start on
http://localhost:3000 by default. You can change the port by setting the PORT
environment variable. ### Building for Production ```bash # Build the
application npm run build # or yarn build # or pnpm build # Start the production
server npm start # or yarn start # or pnpm start ``` ## Project Structure ``` .
├── src/ # Source files │ ├── index.ts # Application entry point │ ├── server.ts
# Express server configuration │ ├── tools/ # Tool implementations │ │ └──
example-tool.ts # Example tool
│ ├── resources/ # Resource implementations │ │ └──
  example-resource.ts # Example resource
│ ├── prompts/ # Prompt templates │ │ └──
  example-prompt.ts # Example prompt
└── dist/ # Compiled output (generated after build) ``` ## API Endpoints
### Tools - **Example Tool**: `POST /api/tools/example` - Request body: `{
"message": "string", "echo": boolean }` - Response: `{ "response": "string" }`

  ### Resources - **Example Resource**: - `GET /api/resources/example` - List
  all items - `GET /api/resources/example/:id` - Get an item by ID - `POST
  /api/resources/example` - Create a new item - `PUT /api/resources/example/:id`
  - Update an item - `DELETE /api/resources/example/:id` - Delete an item

## Environment Variables Create a `.env` file in the project root with the
following variables: ``` PORT=3000 NODE_ENV=development ``` ## Testing ```bash #
Run tests npm test # or yarn test # or pnpm test # Run tests in watch mode npm
run test:watch # or yarn test:watch # or pnpm test:watch ``` ## License This
project is licensed under the MIT License - see the LICENSE file for details.