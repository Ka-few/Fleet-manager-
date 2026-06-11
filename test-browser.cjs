const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('requestfailed', request =>
      console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
    );

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    
    console.log('Checking page content...');
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY HTML LENGTH:', bodyHTML.length);
    if (bodyHTML.length < 500) {
       console.log('BODY SNIPPET:', bodyHTML);
    }
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
