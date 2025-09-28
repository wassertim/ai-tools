import { chromium } from 'playwright';

async function debugDetailed() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    });

    console.log('Navigating to Baeldung JavaPoet page...');
    const response = await page.goto('https://www.baeldung.com/java-poet', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Response status:', response?.status());
    console.log('Response URL:', response?.url());
    console.log('Page title:', await page.title());

    // Take a screenshot for debugging
    await page.screenshot({ path: '/workspace/baeldung-debug.png', fullPage: true });
    console.log('Screenshot saved to baeldung-debug.png');

    // Wait and check if .post-content appears
    await page.waitForTimeout(5000);

    // Check what's actually on the page
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Body text preview:', bodyText);

    // Check for .post-content specifically
    const postContentExists = await page.evaluate(() => {
      const el = document.querySelector('.post-content');
      return el ? 'Found .post-content' : 'No .post-content found';
    });
    console.log(postContentExists);

    // List all elements with 'post' or 'content' in class names
    const relevantElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ');
          classes.forEach(cls => {
            if (cls.includes('post') || cls.includes('content')) {
              elements.push(cls);
            }
          });
        }
      });
      return [...new Set(elements)];
    });
    console.log('Relevant classes:', relevantElements);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugDetailed();