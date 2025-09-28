import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { WebFetcher } from './tools/web-fetcher/WebFetcher.js';
import { BaeldungStrategy, MediumStrategy } from './tools/web-fetcher/strategies/index.js';

const server = new Server(
  {
    name: 'mcp-tools-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const strategies = [
  new BaeldungStrategy(),
  new MediumStrategy()
];

const webFetcher = new WebFetcher(strategies);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [webFetcher.getSchema()],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'web-fetcher') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(await webFetcher.execute(args), null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Tools Server running on stdio');
}

process.on('SIGINT', async () => {
  await webFetcher.cleanup();
  for (const strategy of strategies) {
    if ('cleanup' in strategy && typeof strategy.cleanup === 'function') {
      await strategy.cleanup();
    }
  }
  process.exit(0);
});

runServer().catch(console.error);