import { Tool as MCPTool } from '@modelcontextprotocol/sdk/types.js';

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;

  abstract getSchema(): MCPTool;
  abstract execute(args: any): Promise<any>;
}