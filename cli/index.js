#!/usr/bin/env node

const prompts = require('prompts');
const pc = require('picocolors');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log(pc.cyan('\nWelcome to create-fullstack-app!\n'));

  // Simple argument parsing
  const args = process.argv.slice(2);
  let argProjectName = args[0] && !args[0].startsWith('--') ? args[0] : null;
  let argFrontend = null;
  let argBackend = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--frontend' && args[i + 1]) argFrontend = args[i + 1];
    if (args[i] === '--backend' && args[i + 1]) argBackend = args[i + 1];
  }

  const questions = [];
  if (!argProjectName) {
    questions.push({
      type: 'text',
      name: 'projectName',
      message: 'What is your project named?',
      initial: 'my-fullstack-app',
      validate: value => value.trim().length > 0 ? true : 'Project name cannot be empty'
    });
  }

  if (!argFrontend) {
    questions.push({
      type: 'select',
      name: 'frontend',
      message: 'Which frontend framework would you like to use?',
      choices: [
        { title: 'Next.js', value: 'nextjs', description: 'React framework' },
        { title: 'Angular', value: 'angular', description: 'Enterprise-grade platform' },
        { title: 'Vue', value: 'vue', description: 'Progressive JavaScript framework' },
        { title: 'Svelte', value: 'svelte', description: 'Cybernetically enhanced web apps' }
      ],
      initial: 0
    });
  }

  if (!argBackend) {
    questions.push({
      type: 'select',
      name: 'backend',
      message: 'Which backend framework would you like to use?',
      choices: [
        { title: 'FastAPI', value: 'fastapi', description: 'Modern, fast Python web framework' },
        { title: 'Flask', value: 'flask', description: 'Lightweight WSGI web application framework' }
      ],
      initial: 0
    });
  }

  questions.push({
    type: 'confirm',
    name: 'cleanup',
    message: 'Would you like to remove the CLI source files and templates after scaffolding?',
    initial: false
  });

  const response = await prompts(questions);

  const projectName = argProjectName || response.projectName;
  const frontend = argFrontend || response.frontend;
  const backend = argBackend || response.backend;
  const shouldCleanup = response.cleanup;

  if (!projectName || !frontend || !backend) {
    console.log(pc.red('Setup cancelled.'));
    process.exit(1);
  }
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.log(pc.red(`Directory ${projectName} already exists.`));
    process.exit(1);
  }

  console.log(pc.blue(`\nScaffolding project in ${targetDir}...`));

  // Determine paths to templates relative to the CLI script
  const templatesDir = path.resolve(__dirname, '../templates');
  const baseDir = path.join(templatesDir, 'base');
  const frontendDir = path.join(templatesDir, 'frontend', frontend);
  const backendDir = path.join(templatesDir, 'backend', backend);

  try {
    // 1. Copy base template
    await fs.copy(baseDir, targetDir);
    if (fs.existsSync(path.join(targetDir, 'gitignore'))) {
      await fs.rename(path.join(targetDir, 'gitignore'), path.join(targetDir, '.gitignore'));
    }

    // 2. Copy frontend
    const targetFrontend = path.join(targetDir, 'frontend');
    await fs.copy(frontendDir, targetFrontend);

    // 3. Copy backend
    const targetBackend = path.join(targetDir, 'backend');
    await fs.copy(backendDir, targetBackend);

    // 4. Update package.json name for the frontend
    const pkgPath = path.join(targetFrontend, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = `${projectName}-frontend`;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    // 5. Make all shell scripts executable
    const makeExecutable = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          makeExecutable(filePath);
        } else if (file.endsWith('.sh')) {
          fs.chmodSync(filePath, 0o755);
        }
      });
    };
    makeExecutable(targetDir);

    // 6. Install dependencies
    console.log(pc.blue('\nInstalling dependencies (this may take a minute)...'));

    // Frontend installation
    console.log(pc.cyan('  Installing frontend dependencies...'));
    execSync('npm ci', { cwd: targetFrontend, stdio: 'inherit' });

    // Backend installation
    console.log(pc.cyan('  Setting up backend virtual environment...'));
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    try {
      execSync(`${pythonCmd} -m venv venv`, { cwd: targetBackend, stdio: 'inherit' });
      
      const pipPath = process.platform === 'win32' 
        ? path.join('venv', 'Scripts', 'pip') 
        : path.join('venv', 'bin', 'pip');
      
      console.log(pc.cyan('  Installing backend dependencies...'));
      execSync(`${pipPath} install -r requirements.txt`, { cwd: targetBackend, stdio: 'inherit' });
    } catch (e) {
      console.log(pc.yellow('  Could not set up Python virtual environment automatically. Please set it up manually.'));
    }

    // 7. Initialize Git
    console.log(pc.blue('\nInitializing Git repository...'));
    try {
      const gitDir = path.join(targetDir, '.git');
      if (fs.existsSync(gitDir)) {
        await fs.remove(gitDir);
      }
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
      execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
      execSync('git commit -m "Initial commit from create-fullstack-app"', { cwd: targetDir, stdio: 'ignore' });
      console.log(pc.cyan('  Git repository initialized successfully.'));
    } catch (e) {
      console.log(pc.yellow('  Could not initialize Git repository. You can do it manually with `git init`.'));
    }

    const cliRootDir = path.resolve(__dirname, '..');
    const currentCwd = process.cwd();

    console.log(pc.green(`\nSuccess! Created ${projectName} at ${targetDir}`));

    // 8. Cleanup source files if requested
    if (shouldCleanup) {
      const isInsideDeletedDir = currentCwd.startsWith(cliRootDir) && !currentCwd.startsWith(targetDir);

      if (isInsideDeletedDir) {
        console.log(pc.yellow('\nWARNING: You are running this command from a directory that will be deleted.'));
        console.log(pc.yellow('Your terminal will be left in a non-existent directory.'));
        console.log(pc.yellow(`After this script finishes, please run: cd ${projectName}`));
      }

      console.log(pc.blue('\nCleaning up source files...'));
      const filesToDelete = [
        'cli',
        'templates',
        'tests',
        '.github',
        'run_e2e.sh',
        'playwright.config.js',
        'package.json',
        'package-lock.json',
        'GEMINI.md',
        'LICENSE',
        'README.md'
      ];

      for (const file of filesToDelete) {
        const filePath = path.join(cliRootDir, file);
        if (fs.existsSync(filePath)) {
          await fs.remove(filePath);
        }
      }
      console.log(pc.cyan('  Cleanup completed.'));
    }

    console.log('\nInside that directory, you can run several commands:\n');

    console.log(`  ${pc.cyan('./start.sh')}`);
    console.log('    Starts both the backend and frontend development servers.\n');

    console.log(`  ${pc.cyan('./test.sh')}`);
    console.log('    Runs tests for both frontend and backend.\n');

    console.log(`  ${pc.cyan('./lint.sh')}`);
    console.log('    Lints and formats both frontend and backend code.\n');

    console.log('\nWe suggest that you begin by typing:\n');
    if (shouldCleanup && currentCwd.startsWith(cliRootDir) && !currentCwd.startsWith(targetDir)) {
      console.log(pc.cyan(`  cd .. && cd ${projectName}`));
    } else {
      console.log(pc.cyan(`  cd ${projectName}`));
    }
    console.log(pc.cyan('  ./start.sh'));
    console.log('\nHappy coding!');

  } catch (error) {
    console.error(pc.red('Error scaffolding project:'), error);
    process.exit(1);
  }
}

main().catch(console.error);
