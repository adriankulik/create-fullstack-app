import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.resolve(__dirname, '../cli/index.js');
const TEST_ROOT = path.resolve(__dirname, '../cli-unit-tests-output');

describe('CLI Unit Tests', () => {
  beforeAll(() => {
    if (fs.existsSync(TEST_ROOT)) {
      fs.removeSync(TEST_ROOT);
    }
    fs.mkdirSync(TEST_ROOT);
  });

  afterAll(() => {
    if (fs.existsSync(TEST_ROOT)) {
      fs.removeSync(TEST_ROOT);
    }
  });

  describe('Argument Parsing', () => {
    it('should accept project name as first argument', () => {
      const projectName = 'arg-test-project';
      const projectPath = path.join(TEST_ROOT, projectName);

      execSync(
        `node "${CLI_PATH}" ${projectName} --frontend nextjs --backend fastapi`,
        { cwd: TEST_ROOT, stdio: 'pipe' }
      );

      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'frontend'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend'))).toBe(true);
    }, 120000);

    it('should reject --frontend and --backend as project name', () => {
      // If the first arg starts with --, it should not be treated as the project name
      // This should fail because no project name is provided (in non-interactive mode)
      expect(() =>
        execSync(
          `node "${CLI_PATH}" --frontend nextjs --backend fastapi`,
          { cwd: TEST_ROOT, stdio: 'pipe' }
        )
      ).toThrow();
    }, 30000);
  });

  describe('Directory Validation', () => {
    it('should fail if target directory already exists', () => {
      const projectName = 'existing-dir-test';
      const projectPath = path.join(TEST_ROOT, projectName);
      fs.mkdirSync(projectPath);

      expect(() =>
        execSync(
          `node "${CLI_PATH}" ${projectName} --frontend nextjs --backend fastapi`,
          { cwd: TEST_ROOT, stdio: 'pipe' }
        )
      ).toThrow();
    }, 30000);
  });

  describe('Scaffolded File Structure', () => {
    const projectName = 'structure-test';
    const projectPath = path.join(TEST_ROOT, projectName);

    beforeAll(() => {
      execSync(
        `node "${CLI_PATH}" ${projectName} --frontend vue --backend flask`,
        { cwd: TEST_ROOT, stdio: 'pipe' }
      );
    }, 120000);

    it('should create base scripts', () => {
      expect(fs.existsSync(path.join(projectPath, 'start.sh'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'test.sh'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'lint.sh'))).toBe(true);
    });

    it('should rename gitignore to .gitignore', () => {
      expect(fs.existsSync(path.join(projectPath, '.gitignore'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'gitignore'))).toBe(false);
    });

    it('should create AGENTS.md and .agents directory', () => {
      expect(fs.existsSync(path.join(projectPath, 'AGENTS.md'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.agents'))).toBe(true);
    });

    it('should create .editorconfig', () => {
      expect(fs.existsSync(path.join(projectPath, '.editorconfig'))).toBe(true);
    });

    it('should create .github/workflows/test.yml', () => {
      expect(fs.existsSync(path.join(projectPath, '.github', 'workflows', 'test.yml'))).toBe(true);
    });

    it('should create .vscode/extensions.json', () => {
      expect(fs.existsSync(path.join(projectPath, '.vscode', 'extensions.json'))).toBe(true);
    });

    it('should update frontend package.json name', () => {
      const pkg = fs.readJsonSync(path.join(projectPath, 'frontend', 'package.json'));
      expect(pkg.name).toBe(`${projectName}-frontend`);
    });

    it('should make shell scripts executable', () => {
      const stats = fs.statSync(path.join(projectPath, 'start.sh'));
      // Check that the execute bit is set (owner execute = 0o100)
      expect(stats.mode & 0o100).toBeTruthy();
    });

    it('should initialize a git repository', () => {
      expect(fs.existsSync(path.join(projectPath, '.git'))).toBe(true);
    });
  });

  describe('Backend-Specific Files', () => {
    it('should scaffold fastapi backend correctly', () => {
      const projectName = 'fastapi-test';
      const projectPath = path.join(TEST_ROOT, projectName);

      execSync(
        `node "${CLI_PATH}" ${projectName} --frontend nextjs --backend fastapi`,
        { cwd: TEST_ROOT, stdio: 'pipe' }
      );

      expect(fs.existsSync(path.join(projectPath, 'backend', 'main.py'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'requirements.txt'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'test_main.py'))).toBe(true);
    }, 120000);

    it('should scaffold dotnet backend correctly', () => {
      const projectName = 'dotnet-test';
      const projectPath = path.join(TEST_ROOT, projectName);

      execSync(
        `node "${CLI_PATH}" ${projectName} --frontend nextjs --backend dotnet`,
        { cwd: TEST_ROOT, stdio: 'pipe' }
      );

      expect(fs.existsSync(path.join(projectPath, 'backend', 'Program.cs'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'backend.sln'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'dotnet.csproj'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'Tests'))).toBe(true);
    }, 120000);

    it('should scaffold nodejs backend correctly', () => {
      const projectName = 'nodejs-test';
      const projectPath = path.join(TEST_ROOT, projectName);

      execSync(
        `node "${CLI_PATH}" ${projectName} --frontend nextjs --backend nodejs`,
        { cwd: TEST_ROOT, stdio: 'pipe' }
      );

      expect(fs.existsSync(path.join(projectPath, 'backend', 'src', 'index.ts'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'backend', 'tsconfig.json'))).toBe(true);
    }, 120000);
  });
});
