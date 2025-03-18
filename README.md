# Requirements Gathering Tool

An MCP application that helps users gather requirements for their tasks through clarifying questions to build a detailed specifications document.

## Overview

This tool assists users in gathering comprehensive requirements for projects across different domains. It uses a conversational approach to ask relevant questions based on the project's domain and user responses, then generates a structured specification document.

## Features

- Domain-specific questioning tailored to different fields (software development, marketing, design, research, etc.)
- Conversational interface to extract requirements naturally
- Structured output in multiple formats (markdown, JSON, PDF)
- Automatic categorization of requirements into:
  - Functional requirements
  - Non-functional requirements
  - Constraints and limitations
  - Assumptions
  - Risks
  - Dependencies

## Installation

1. Clone this repository
2. Install dependencies:

```
npm install
```

## Usage

1. Start the server:

```
npm start
```

2. Use the MCP tool with your compatible client:

```
{
  "task_description": "Build a mobile app for tracking daily water intake",
  "domain": "software development",
  "output_format": "markdown"
}
```

## Supported Domains

- Software Development
- Marketing
- Design
- Research
- General (for domains not specifically supported)

## Output Formats

- Markdown (default)
- JSON
- PDF (basic implementation)

## How It Works

1. The user provides an initial task description and domain
2. The tool initiates a conversation with domain-specific initial questions
3. As the user responds, follow-up questions are asked to gather more detailed requirements
4. The tool extracts requirements from the conversation
5. A structured specification document is generated in the requested format

## Development

### Project Structure

- `index.js` - Main entry point
- `src/tools/requirements_gatherer.js` - MCP tool implementation
- `src/prompts/requirements_gathering_prompt.js` - Prompt for guiding the conversation
- `src/resources/` - Additional resources

### Adding New Domains

To add support for new domains, update the `getDomainSpecificQuestions` function in `src/tools/requirements_gatherer.js` with domain-specific questions.

## License

MIT
