import { chromium } from 'playwright';

async function debugBaeldung() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    console.log('Navigating to Baeldung JavaPoet page...');
    await page.goto('https://www.baeldung.com/java-poet', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Page loaded. Title:', await page.title());

    // Wait a bit for dynamic content
    await page.waitForTimeout(3000);

    // Look for common selectors
    const selectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
      '.main-content',
      '.post',
      '.article-content',
      '.post-body',
      '.entry',
      '[class*="content"]',
      '[class*="post"]',
      '[class*="article"]'
    ];

    console.log('\nTesting selectors:');
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const text = await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            return el ? el.innerText.substring(0, 100) + '...' : null;
          }, selector);
          console.log(`✅ ${selector}: Found ${elements.length} element(s)`);
          if (text) {
            console.log(`   Content preview: ${text}`);
          }
        } else {
          console.log(`❌ ${selector}: Not found`);
        }
      } catch (e) {
        console.log(`❌ ${selector}: Error - ${e.message}`);
      }
    }

    // Get all elements with class names containing common words
    const allClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('*[class]');
      const classSet = new Set();
      elements.forEach(el => {
        el.className.split(' ').forEach(cls => {
          if (cls && (cls.includes('content') || cls.includes('post') || cls.includes('article') || cls.includes('main'))) {
            classSet.add('.' + cls);
          }
        });
      });
      return Array.from(classSet).slice(0, 10);
    });

    console.log('\nRelevant classes found:', allClasses);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugBaeldung();