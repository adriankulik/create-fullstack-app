const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000');
  await page.fill('#numberInput', '21');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  console.log(await page.content());
  await browser.close();
})();
