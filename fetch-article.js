import { WebFetcher } from './dist/tools/web-fetcher/WebFetcher.js';
import { BaeldungStrategy, MediumStrategy } from './dist/tools/web-fetcher/strategies/index.js';

async function fetchArticle(url) {
  const strategies = [
    new BaeldungStrategy(),
    new MediumStrategy()
  ];

  const webFetcher = new WebFetcher(strategies);

  try {
    console.log(`\n🔍 Fetching: ${url}`);
    console.log('⏳ Please wait...\n');

    const result = await webFetcher.execute({
      url: url,
      timeout: 30000
    });

    if (result.error) {
      console.error('❌ Error:', result.error);
      return;
    }

    console.log('✅ Successfully fetched content!');
    console.log(`📄 Title: ${result.title || 'No title'}`);
    console.log(`🔗 URL: ${result.url}`);
    console.log(`📊 Status: ${result.status}`);
    console.log(`📝 Content length: ${result.content.length} characters\n`);

    console.log('📖 Content:');
    console.log('='.repeat(80));
    console.log(result.content);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Failed to fetch article:', error.message);
  } finally {
    await webFetcher.cleanup();
    for (const strategy of strategies) {
      if (strategy.cleanup) {
        await strategy.cleanup();
      }
    }
  }
}

// Get URL from command line argument
const url = process.argv[2];

if (!url) {
  console.log('Usage: node fetch-article.js <URL>');
  console.log('Example: node fetch-article.js https://www.baeldung.com/java-poet');
  process.exit(1);
}

fetchArticle(url);