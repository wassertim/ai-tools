import { chromium, Browser, Page } from 'playwright';
import { BaseTool } from '../base/Tool.js';
import { WebFetchRequest, WebFetchResponse, FetchStrategy } from '../../types/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export class WebFetcher extends BaseTool {
  name = 'web-fetcher';
  description = 'Fetches web content using Playwright to bypass anti-bot measures';

  private browser: Browser | null = null;
  private strategies: FetchStrategy[] = [];

  constructor(strategies: FetchStrategy[] = []) {
    super();
    this.strategies = strategies;
  }

  getSchema(): Tool {
    return {
      name: this.name,
      description: this.description,
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch'
          },
          timeout: {
            type: 'number',
            description: 'Timeout in milliseconds (default: 30000)',
            default: 30000
          },
          userAgent: {
            type: 'string',
            description: 'Custom user agent string'
          },
          waitForSelector: {
            type: 'string',
            description: 'CSS selector to wait for before extracting content'
          }
        },
        required: ['url']
      }
    };
  }

  async execute(args: any): Promise<WebFetchResponse> {
    const request: WebFetchRequest = {
      url: args.url,
      options: {
        timeout: args.timeout || 30000,
        userAgent: args.userAgent,
        waitForSelector: args.waitForSelector
      }
    };

    // Check if any strategy can handle this URL
    for (const strategy of this.strategies) {
      if (strategy.canHandle(request.url)) {
        return await strategy.fetch(request);
      }
    }

    // Default implementation
    return await this.defaultFetch(request);
  }

  private async defaultFetch(request: WebFetchRequest): Promise<WebFetchResponse> {
    let page: Page | null = null;

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

      page = await this.browser.newPage();

      const userAgent = request.options?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      await page.setExtraHTTPHeaders({
        'User-Agent': userAgent
      });

      await page.setViewportSize({ width: 1920, height: 1080 });

      const response = await page.goto(request.url, {
        waitUntil: 'domcontentloaded',
        timeout: request.options?.timeout || 30000
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      if (request.options?.waitForSelector) {
        await page.waitForSelector(request.options.waitForSelector, {
          timeout: 10000
        });
      }

      await page.waitForTimeout(2000);

      const title = await page.title();
      const content = await page.evaluate(() => {
        const article = document.querySelector('article, .article, .post, .content, main, .main-content') as HTMLElement;
        if (article) {
          return article.innerText;
        }
        return document.body.innerText;
      });

      return {
        content: content.trim(),
        url: request.url,
        title,
        status: response.status()
      };

    } catch (error) {
      return {
        content: '',
        url: request.url,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}