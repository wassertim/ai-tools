# Docker Deployment Guide

This document explains how to containerize and deploy the MCP Tools Server using Docker.

## Quick Start

### Build and Run with Docker Compose (Recommended)
```bash
# Build and start the container
npm run docker:compose:up

# View logs
npm run docker:compose:logs

# Stop the container
npm run docker:compose:down
```

### Build and Run with Docker CLI
```bash
# Build the image
npm run docker:build

# Run the container (stdio mode)
npm run docker:run
```

## Container Architecture

- **Base Image**: Microsoft Playwright (`mcr.microsoft.com/playwright:v1.55.1-noble`)
- **Build**: Multi-stage build for optimized production image
- **Security**: Runs as non-root user (`mcpuser`)
- **Size**: ~1GB (includes Chromium browser for web fetching)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build the Docker image |
| `npm run docker:run` | Run container in stdio mode |
| `npm run docker:compose:up` | Start with Docker Compose |
| `npm run docker:compose:down` | Stop Docker Compose services |
| `npm run docker:compose:logs` | View container logs |
| `npm run docker:push` | Push to registry (update registry URL first) |

## Usage in Other Projects

### Option 1: Docker Compose Integration
Add to your existing `docker-compose.yml`:

```yaml
services:
  mcp-tools-server:
    image: mcp-tools-server:latest
    stdin_open: true
    tty: true
    environment:
      - NODE_ENV=production
```

### Option 2: Standalone Container
```bash
# Pull from registry (if published)
docker pull your-registry/mcp-tools-server:latest

# Run as a service
docker run -d --name mcp-tools \
  --restart unless-stopped \
  -i your-registry/mcp-tools-server:latest
```

### Option 3: Sidecar Pattern
Run alongside your main application:

```yaml
services:
  your-app:
    image: your-app:latest
    # your app config

  mcp-tools:
    image: mcp-tools-server:latest
    stdin_open: true
    tty: true
```

## Configuration

### Environment Variables
Add to `docker-compose.yml` or pass with `-e`:

```yaml
environment:
  - NODE_ENV=production
  - CUSTOM_USER_AGENT=YourApp/1.0
  - DEFAULT_TIMEOUT=30000
```

### Volume Mounts
For persistent configuration:

```yaml
volumes:
  - ./config:/app/config:ro
  - mcp_data:/app/data
```

## Registry Deployment

### Docker Hub
```bash
# Tag for Docker Hub
docker tag mcp-tools-server:latest username/mcp-tools-server:latest

# Push to Docker Hub
docker push username/mcp-tools-server:latest
```

### Private Registry
```bash
# Tag for private registry
docker tag mcp-tools-server:latest registry.company.com/mcp-tools-server:latest

# Push to private registry
docker push registry.company.com/mcp-tools-server:latest
```

## Communication Patterns

### Current: Stdio-based
The container communicates via stdin/stdout (standard MCP protocol):

```bash
# Interactive mode
docker run -i mcp-tools-server:latest

# With docker-compose
stdin_open: true
tty: true
```

### Future: TCP/HTTP
If you add TCP transport, expose ports:

```yaml
ports:
  - "3000:3000"
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs mcp-tools-server

# Or with compose
npm run docker:compose:logs
```

### Playwright Issues
The container includes Chromium browser. If you encounter issues:

1. Check browser permissions
2. Verify security options aren't too restrictive
3. Ensure sufficient memory allocation (min 512MB)

### Resource Usage
- **Memory**: ~512MB-1GB depending on usage
- **CPU**: Variable based on web fetching frequency
- **Storage**: ~1GB for image

## Health Checks

The container includes health checks:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 15 seconds

Check health status:
```bash
docker ps
# Look for "healthy" status
```

## Security Considerations

- Runs as non-root user
- No privileged access required
- Network isolation via Docker networks
- Resource limits configured in docker-compose.yml

## Adding New Tools

When adding new tools to the container:

1. Update dependencies in `package.json`
2. Add any system dependencies to `Dockerfile` if needed
3. Rebuild the image: `npm run docker:build`
4. Update this documentation

The Playwright base image provides a solid foundation for most web-related tools and many system utilities.