#!/usr/bin/env node

const prompts = require('prompts');
const pc = require('picocolors');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log(pc.cyan('\nWelcome to create-fullstack-app!\n'));

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'What is your project named?',
      initial: 'my-fullstack-app',
      validate: value => value.trim().length > 0 ? true : 'Project name cannot be empty'
    },
    {
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
    },
    {
      type: 'select',
      name: 'backend',
      message: 'Which backend framework would you like to use?',
      choices: [
        { title: 'FastAPI', value: 'fastapi', description: 'Modern, fast Python web framework' },
        { title: 'Flask', value: 'flask', description: 'Lightweight WSGI web application framework' }
      ],
      initial: 0
    }
  ]);

  if (!response.projectName || !response.frontend || !response.backend) {
    console.log(pc.red('Setup cancelled.'));
    process.exit(1);
  }

  const { projectName, frontend, backend } = response;
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

    // 5. Make shell scripts executable
    const scripts = ['start.sh', 'test.sh', 'lint.sh'];
    scripts.forEach(script => {
      const scriptPath = path.join(targetDir, script);
      if (fs.existsSync(scriptPath)) {
        fs.chmodSync(scriptPath, 0o755);
      }
    });

    // 6. Install dependencies
    console.log(pc.blue('\nInstalling dependencies (this may take a minute)...'));

    // Frontend installation
    console.log(pc.cyan('  Installing frontend dependencies...'));
    execSync('npm install', { cwd: targetFrontend, stdio: 'inherit' });

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

    console.log(pc.green(`\nSuccess! Created ${projectName} at ${targetDir}`));
    console.log('\nInside that directory, you can run several commands:\n');

    console.log(`  ${pc.cyan('./start.sh')}`);
    console.log('    Starts both the backend and frontend development servers.\n');

    console.log(`  ${pc.cyan('./test.sh')}`);
    console.log('    Runs tests for both frontend and backend.\n');

    console.log(`  ${pc.cyan('./lint.sh')}`);
    console.log('    Lints and formats both frontend and backend code.\n');

    console.log('\nWe suggest that you begin by typing:\n');
    console.log(pc.cyan(`  cd ${projectName}`));
    console.log(pc.cyan('  ./start.sh'));
    console.log('\nHappy coding!');

  } catch (error) {
    console.error(pc.red('Error scaffolding project:'), error);
    process.exit(1);
  }
}

main().catch(console.error);
