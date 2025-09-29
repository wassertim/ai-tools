# MCP Tools Server

A Model Context Protocol (MCP) server providing specialized tools for AI agents, including advanced web scraping capabilities that bypass anti-bot detection mechanisms.

## 🚀 Features

- **Web Fetching**: Playwright-based web scraper that handles bot detection
- **Site-Specific Strategies**: Optimized scraping for popular sites (Baeldung, Medium)
- **Anti-Bot Detection**: Advanced evasion techniques including user agent spoofing and JavaScript injection
- **Extensible Architecture**: Easy to add new tools and strategies
- **Docker Ready**: Containerized deployment for easy integration

## 📋 Prerequisites

- Docker (recommended) or Node.js 18+
- Claude Desktop or any MCP-compatible client

## 🔧 Installation

### Option 1: Docker (Recommended)

1. **Build the Docker image:**
   ```bash
   docker build -t mcp-tools-server:latest .
   ```

2. **Add to Claude Desktop:**
   ```bash
   claude mcp add-json mcp-tools-server '{"command": "docker", "args": ["run", "--rm", "-i", "mcp-tools-server:latest"]}'
   ```

### Option 2: Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd mcp-tools-server
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Add to Claude Desktop:**
   ```bash
   claude mcp add-json mcp-tools-server '{"command": "node", "args": ["dist/index.js"], "cwd": "/path/to/mcp-tools-server"}'
   ```

## 🛠️ Available Tools

### Web Fetcher

Fetches web content using Playwright to bypass anti-bot measures and extract clean text content.

**Parameters:**
- `url` (required): The URL to fetch
- `timeout` (optional): Timeout in milliseconds (default: 30000)
- `userAgent` (optional): Custom user agent string
- `waitForSelector` (optional): CSS selector to wait for before extracting content

**Example Usage:**
```json
{
  "tool": "web-fetcher",
  "arguments": {
    "url": "https://www.baeldung.com/java-collections",
    "timeout": 45000,
    "waitForSelector": ".post-content"
  }
}
```

**Supported Sites with Enhanced Strategies:**
- **Baeldung.com**: Optimized content extraction with code block formatting
- **Medium.com**: Article-specific scraping with clean text extraction
- **General Sites**: Fallback strategy for any website

## 🏗️ Architecture

```
src/
├── index.ts                 # MCP server entry point
├── tools/
│   ├── base/
│   │   └── Tool.ts         # Base tool interface
│   └── web-fetcher/
│       ├── WebFetcher.ts   # Main web fetcher implementation
│       └── strategies/     # Site-specific strategies
│           ├── BaeldungStrategy.ts
│           ├── MediumStrategy.ts
│           └── index.ts
├── types/
│   └── index.ts           # TypeScript type definitions
├── config/                # Configuration files
└── utils/                 # Shared utilities
```

## 🔨 Development

### Prerequisites
- Node.js 18+
- TypeScript
- Playwright

### Setup
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build
```

### Adding New Tools

1. **Create your tool class:**
   ```typescript
   import { BaseTool } from '../base/Tool.js';

   export class YourTool extends BaseTool {
     name = 'your-tool';
     description = 'Description of your tool';

     getSchema() {
       // Define MCP tool schema
     }

     async execute(args: any) {
       // Implement tool logic
     }
   }
   ```

2. **Register in index.ts:**
   ```typescript
   import { YourTool } from './tools/your-tool/YourTool.js';

   const yourTool = new YourTool();

   // Add to tools list and handlers
   ```

### Adding Web Fetcher Strategies

1. **Implement the FetchStrategy interface:**
   ```typescript
   import { FetchStrategy, WebFetchRequest, WebFetchResponse } from '../../types/index.js';

   export class YourSiteStrategy implements FetchStrategy {
     canHandle(url: string): boolean {
       return url.includes('yoursite.com');
     }

     async fetch(request: WebFetchRequest): Promise<WebFetchResponse> {
       // Site-specific implementation
     }
   }
   ```

2. **Register the strategy:**
   ```typescript
   const strategies = [
     new BaeldungStrategy(),
     new MediumStrategy(),
     new YourSiteStrategy() // Add here
   ];
   ```

## 🐳 Docker

### Building
```bash
# Build the image
npm run docker:build

# Run locally
npm run docker:run

# Use docker-compose
npm run docker:compose:up
```

### Production Deployment
Docker images are automatically built and pushed to Docker Hub when PRs are merged to main via GitHub Actions.

**Manual deployment:**
```bash
# Tag and push to registry
npm run docker:push
```

### CI/CD Setup
To enable automatic Docker image publishing, configure the following secrets in your GitHub repository:

1. **`DOCKER_USERNAME`**: Your Docker Hub username
2. **`DOCKER_PASSWORD`**: Your Docker Hub password or access token

**Setting up secrets:**
1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add both `DOCKER_USERNAME` and `DOCKER_PASSWORD`

### Automated Workflows

**On PR Merge:**
- Build multi-platform Docker images (AMD64 and ARM64)
- Tag images with branch name, commit SHA, and `latest`
- Push to `{your-username}/mcp-tools-server` on Docker Hub

**Manual Release (GitHub Actions → Run workflow):**
- **Version Bump**: Choose `patch`, `minor`, or `major` to automatically increment `package.json` version
- **Use Package Version**: Uses current `package.json` version for Docker tag (e.g., `v1.2.3`)
- **Tag as Latest**: Optionally tag as `latest` in addition to version tag
- **GitHub Release**: Automatically creates a GitHub release with Docker pull instructions

### Release Process
1. Go to **Actions** → **Build and Push Docker Image** → **Run workflow**
2. Select version bump type (`patch` for bug fixes, `minor` for features, `major` for breaking changes)
3. Choose whether to tag as `latest`
4. The workflow will:
   - Bump `package.json` version
   - Commit and push the version change
   - Build and tag Docker image with new version
   - Create GitHub release with:
     - Docker pull command for the specific version
     - Claude MCP installation command with version-pinned Docker image
     - Links to Docker Hub and installation guide

## 🔒 Security Features

- **Non-root container execution** for enhanced security
- **Anti-bot detection evasion** without malicious intent
- **Sandboxed browser execution** with security flags
- **Minimal attack surface** with multi-stage Docker builds

## 📝 Configuration

The server currently uses sensible defaults but can be extended with configuration files in the `src/config/` directory for:
- Custom timeouts
- Default user agents
- Strategy-specific settings
- Rate limiting (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙋‍♂️ Troubleshooting

### Common Issues

**Docker build fails:**
- Ensure Docker has enough memory allocated (recommend 4GB+)
- Try building with `--no-cache` flag

**Playwright crashes:**
- Verify the container has sufficient memory
- Check if running in a sandboxed environment that blocks browser execution

**MCP connection issues:**
- Verify the tool is properly registered in Claude Desktop
- Check that the Docker container starts without errors
- Ensure the container can access the internet for web fetching

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Claude Desktop](https://claude.ai/)