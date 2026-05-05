import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.resolve(__dirname, '../cli/index.js');
const TEST_ROOT = path.resolve(__dirname, '../e2e-tests-output');

const FRONTENDS = ['nextjs', 'angular', 'vue', 'svelte'];
const BACKENDS = ['fastapi', 'flask'];

describe('CLI End-to-End Tests', () => {
  beforeAll(() => {
    if (fs.existsSync(TEST_ROOT)) {
      fs.removeSync(TEST_ROOT);
    }
    fs.mkdirSync(TEST_ROOT);
  });

  for (const frontend of FRONTENDS) {
    for (const backend of BACKENDS) {
      const projectName = `${frontend}-${backend}`;
      const projectPath = path.join(TEST_ROOT, projectName);

      it(`should scaffold and verify ${projectName}`, { timeout: 300000 }, () => {
        console.log(`Testing combination: ${projectName}...`);

        execSync(`node "${CLI_PATH}" ${projectName} --frontend ${frontend} --backend ${backend}`, {
          cwd: TEST_ROOT,
          stdio: 'pipe' 
        });

        // Verify files exist
        expect(fs.existsSync(path.join(projectPath, 'frontend'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, 'backend'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, 'start.sh'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, 'test.sh'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, 'lint.sh'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);

        // Run lint.sh
        console.log(`  Running lint.sh for ${projectName}...`);
        execSync('./lint.sh', { cwd: projectPath, stdio: 'inherit' });

        // Run test.sh
        console.log(`  Running test.sh for ${projectName}...`);
        execSync('./test.sh', { cwd: projectPath, stdio: 'inherit' });

        console.log(`  Successfully verified ${projectName}`);
      });
    }
  }
});
