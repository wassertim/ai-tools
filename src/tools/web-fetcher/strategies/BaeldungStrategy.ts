import { chromium, Browser, Page } from 'playwright';
import { FetchStrategy, WebFetchRequest, WebFetchResponse } from '../../../types/index.js';

export class BaeldungStrategy implements FetchStrategy {
  private browser: Browser | null = null;

  canHandle(url: string): boolean {
    return url.includes('baeldung.com');
  }

  async fetch(request: WebFetchRequest): Promise<WebFetchResponse> {
    let page: Page | null = null;

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

      page = await this.browser.newPage();

      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      });

      await page.setViewportSize({ width: 1920, height: 1080 });

      // Add additional anti-detection measures
      await page.addInitScript(() => {
        // Override webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
      });

      const response = await page.goto(request.url, {
        waitUntil: 'domcontentloaded',
        timeout: request.options?.timeout || 30000
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      // Wait for page to load completely
      await page.waitForTimeout(5000);

      const title = await page.title();
      const content = await page.evaluate(() => {
        const articleContent = document.querySelector('.post-content') as HTMLElement;
        if (articleContent) {
          // Create a copy to avoid modifying the original
          const contentCopy = articleContent.cloneNode(true) as HTMLElement;

          // Format code blocks
          const codeBlocks = contentCopy.querySelectorAll('pre, code');
          codeBlocks.forEach((block, index) => {
            const codeText = block.textContent || '';
            block.textContent = `\n\n[CODE BLOCK ${index + 1}]\n${codeText}\n[/CODE BLOCK ${index + 1}]\n\n`;
          });

          return contentCopy.innerText;
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