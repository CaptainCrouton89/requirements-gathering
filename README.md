# Requirements Gatherer

A TypeScript MCP application that helps users gather requirements for their projects through clarifying questions and generates detailed specifications documents.

## Overview

Requirements Gatherer is designed to facilitate the requirements gathering process by:

1. Collecting basic project information
2. Asking intelligent clarifying questions based on the project context
3. Categorizing requirements into functional, non-functional, constraints, and assumptions
4. Generating comprehensive specifications documents in different formats

## Features

- **Structured Requirements Collection**: Systematically gather project information following best practices
- **Intelligent Questioning**: Ask relevant questions based on project type and context
- **Progressive Refinement**: Move through stages of requirements gathering from initial to detailed
- **Automatic Categorization**: Organize requirements into appropriate categories
- **Flexible Output**: Generate specification documents in Markdown or JSON formats
- **Customizable Sections**: Choose which sections to include in your specifications document

## Installation

Make sure you have Node.js 18 or newer installed.

```bash
# Clone the repository
git clone https://github.com/yourusername/requirements-gatherer.git
cd requirements-gatherer

# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

## Usage

The application exposes a REST API that can be used to gather requirements and generate specifications.

### API Endpoints

#### Start Requirements Gathering

```
POST /api/tools/start-requirements

{
  "projectName": "My Project",
  "projectDescription": "A detailed description of the project",
  "projectType": "web",
  "projectTypeDetails": "React-based SPA",
  "targetCompletion": "Q3 2023",
  "stakeholders": ["Product Manager", "Technical Lead", "UX Designer"]
}
```

#### Get Clarifying Questions

```
POST /api/tools/ask-clarifying-questions/ask

{
  "projectId": "your-project-id",
  "generateNew": false
}
```

#### Answer Clarifying Questions

```
POST /api/tools/ask-clarifying-questions/answer

{
  "projectId": "your-project-id",
  "answers": {
    "What browsers and versions need to be supported?": "Chrome, Firefox, Safari latest versions",
    "Is this a public-facing website or internal application?": "Public-facing"
  }
}
```

#### Generate Specification Document

```
POST /api/tools/generate-specification

{
  "projectId": "your-project-id",
  "format": "markdown",
  "includeSections": ["overview", "functionalRequirements", "nonFunctionalRequirements"]
}
```

## Development

To run the application in development mode with hot reloading:

```bash
npm run dev
```

### Project Structure

```
requirements-gatherer/
├── src/                    # Source code
│   ├── tools/              # API tools
│   │   ├── start-requirements-tool.ts
│   │   ├── ask-clarifying-questions-tool.ts
│   │   └── generate-specification-tool.ts
│   ├── prompts/            # AI prompts
│   │   ├── requirements-system-prompt.ts
│   │   ├── clarifying-questions-prompt.ts
│   │   └── specification-generator-prompt.ts
│   ├── resources/          # API resources
│   ├── server.ts           # Express server configuration
│   └── index.ts            # Entry point
├── data/                   # Requirements data storage (created on first run)
├── dist/                   # Compiled JavaScript (generated on build)
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Extending the Application

### Adding New Question Types

To add new question types based on project categories, modify the `generateClarifyingQuestions` function in `src/tools/ask-clarifying-questions-tool.ts`.

### Adding New Specification Formats

To add new output formats, update the `generateSpecificationDocument` function in `src/tools/generate-specification-tool.ts`.

## License

MIT