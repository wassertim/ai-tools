# MCP Tools Server

This project is an MCP (Model Context Protocol) server with custom tools, including a Playwright-based web fetcher for sites that block AI agents.

## Development Principles

- **KISS (Keep It Simple, Stupid)**: Favor simple, straightforward solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's actually needed
- Only implement what's required, avoid over-engineering

## Setup

Install dependencies:
```bash
npm install
```

## Project Structure

```
src/
├── tools/
│   ├── base/          # Base classes/interfaces
│   └── web-fetcher/   # Playwright-based web fetcher
│       └── strategies/ # Site-specific strategies (Baeldung, etc.)
├── config/            # Configuration management
├── utils/             # Shared utilities
└── types/             # Type definitions
```

## Development Commands

- `npm run dev` - Development mode with watch
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run type-check` - Type checking

## Docker

The server can be containerized and deployed as a standalone Docker container for reuse across different Claude instances.