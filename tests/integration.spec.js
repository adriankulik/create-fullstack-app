import { test, expect } from '@playwright/test';

test('End-to-End Integration Test', async ({ page }) => {
  const frontend = process.env.FRONTEND || 'nextjs';
  let port = 3000;
  if (frontend === 'angular') port = 4200;
  if (frontend === 'vue' || frontend === 'svelte') port = 5173;

  const url = `http://localhost:${port}`;
  
  // Navigate to the frontend app
  await page.goto(url, { waitUntil: 'networkidle' });

  // Locate the input field and enter a number
  const input = page.locator('#numberInput');
  await input.fill('21');

  // Submit the form
  const button = page.locator('button[type="submit"]');
  await button.click();

  // Wait for the result to appear
  const resultStrong = page.locator('strong:has-text("Result:")');
  await resultStrong.waitFor({ state: 'visible', timeout: 10000 });

  // Verify the calculated value is correct (21 * 2 = 42)
  const resultDiv = resultStrong.locator('..');
  await expect(resultDiv).toContainText('42');
});
