import { chromium, Browser, Page } from 'playwright';
import { FetchStrategy, WebFetchRequest, WebFetchResponse } from '../../../types/index.js';

export class MediumStrategy implements FetchStrategy {
  private browser: Browser | null = null;

  canHandle(url: string): boolean {
    return url.includes('medium.com') || url.includes('@');
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
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      await page.setViewportSize({ width: 1440, height: 900 });

      const response = await page.goto(request.url, {
        waitUntil: 'networkidle',
        timeout: request.options?.timeout || 30000
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      await page.waitForSelector('article, [data-testid="storyContent"], .postArticle-content', {
        timeout: 15000
      });

      await page.waitForTimeout(3000);

      await page.evaluate(() => {
        const paywall = document.querySelector('.paywall, .meteredContent, [data-testid="paywall"]');
        if (paywall) {
          paywall.remove();
        }
      });

      const title = await page.title();
      const content = await page.evaluate(() => {
        const selectors = [
          'article [data-selectable-paragraph]',
          '.postArticle-content p',
          '[data-testid="storyContent"] p',
          'article p'
        ];

        let paragraphs: string[] = [];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
          if (elements.length > 0) {
            paragraphs = Array.from(elements).map(el => el.innerText.trim()).filter(text => text.length > 0);
            break;
          }
        }

        if (paragraphs.length === 0) {
          const article = document.querySelector('article, .postArticle, [data-testid="storyContent"]') as HTMLElement;
          if (article) {
            return article.innerText;
          }
          return document.body.innerText;
        }

        return paragraphs.join('\n\n');
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