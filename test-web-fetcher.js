import { WebFetcher } from './dist/tools/web-fetcher/WebFetcher.js';
import { BaeldungStrategy, MediumStrategy } from './dist/tools/web-fetcher/strategies/index.js';

async function testWebFetcher() {
  const strategies = [
    new BaeldungStrategy(),
    new MediumStrategy()
  ];

  const webFetcher = new WebFetcher(strategies);

  console.log('Testing web fetcher with example.com...');

  try {
    const result = await webFetcher.execute({
      url: 'https://example.com',
      timeout: 10000
    });

    console.log('Result:', {
      url: result.url,
      title: result.title,
      status: result.status,
      contentLength: result.content.length,
      error: result.error
    });

    if (result.content.length > 0) {
      console.log('First 200 chars of content:', result.content.substring(0, 200));
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await webFetcher.cleanup();
    for (const strategy of strategies) {
      if (strategy.cleanup) {
        await strategy.cleanup();
      }
    }
  }
}

testWebFetcher();