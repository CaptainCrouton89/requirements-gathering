# Requirements Gathering MCP

A Multi-Agent Conversational Process (MCP) server for gathering and managing project requirements. This MCP server provides tools for creating, updating, and tracking requirements, stakeholders, and projects.

## Features

- Create, update, and list requirements
- Track requirement changes and history
- Manage stakeholders and their associations with requirements
- Create projects and link them to requirements and stakeholders
- Persistent storage of all data

## Installation

```bash
# Install dependencies
pnpm install
```

## Usage

### Starting the server

```bash
# Development mode (with auto-restart)
pnpm dev

# Production mode
pnpm start

# Build TypeScript files (outputs to dist/)
pnpm build
```

### Available Tools

#### Requirements

- `requirements/add`: Add a new requirement

  - Parameters: `title`, `description`, `priority`, `category`, `status` (optional)

- `requirements/update`: Update an existing requirement

  - Parameters: `id`, `title` (optional), `description` (optional), `priority` (optional), `category` (optional), `status` (optional), `updatedBy`

- `requirements/list`: List requirements (can be filtered)

  - Parameters: `category` (optional), `status` (optional), `priority` (optional)

- `requirements/get`: Get details of a specific requirement

  - Parameters: `id`

- `requirements/history`: View the history of changes to a requirement
  - Parameters: `id`

#### Stakeholders

- `stakeholders/add`: Add a new stakeholder
  - Parameters: `name`, `role`, `contactInfo` (optional), `requirements` (optional)

#### Projects

- `projects/add`: Add a new project
  - Parameters: `name`, `description`, `startDate`, `endDate` (optional), `status` (optional), `requirements` (optional), `stakeholders` (optional)

### Data Storage

All data is stored in JSON format in the `./data/requirements.json` file.

## Project Structure

- `src/server.ts`: Main MCP server implementation
- `src/types.ts`: TypeScript interfaces for requirements, stakeholders, and projects
- `src/store.ts`: Data storage implementation
- `src/tools/requirements.ts`: Implementation of requirements-related tools

## Development

This project uses:

- TypeScript for type safety
- Zod for schema validation
- MCP SDK for server implementation

## License

ISC
