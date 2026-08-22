import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

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
  const randomNumber = Math.floor(Math.random() * 100) + 1; // Use random to avoid false positives from previous runs
  await input.fill(randomNumber.toString());

  // Submit the form
  const button = page.locator('button[type="submit"]');
  await button.click();

  // Wait for the result to appear
  const resultStrong = page.locator('strong:has-text("Result:")');
  await resultStrong.waitFor({ state: 'visible', timeout: 10000 });

  // Verify the calculated value is correct
  const expectedResult = randomNumber * 2;
  const resultDiv = resultStrong.locator('..');
  await expect(resultDiv).toContainText(expectedResult.toString());

  // Verify the result is stored in the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/appdb'
  });
  
  const dbResult = await pool.query('SELECT * FROM calculations WHERE input_number = $1 ORDER BY id DESC LIMIT 1', [randomNumber]);
  expect(dbResult.rows.length).toBe(1);
  expect(dbResult.rows[0].result).toBe(expectedResult);
  
  await pool.end();
});
