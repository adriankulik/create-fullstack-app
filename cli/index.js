#!/usr/bin/env node

const prompts = require("prompts");
const pc = require("picocolors");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

async function main() {
  const { asciiArt } = require("./logo");
  console.log(pc.cyan(asciiArt));
  console.log(pc.cyan("\nWelcome to create-fullstack-app!\n"));

  // Simple argument parsing
  const args = process.argv.slice(2);
  let argProjectName = args[0] && !args[0].startsWith("--") ? args[0] : null;
  let argFrontend = null;
  let argBackend = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--frontend" && args[i + 1]) argFrontend = args[i + 1];
    if (args[i] === "--backend" && args[i + 1]) argBackend = args[i + 1];
  }

  const questions = [];
  if (!argProjectName) {
    questions.push({
      type: "text",
      name: "projectName",
      message: "What is your project named?",
      initial: "my-fullstack-app",
      validate: (value) =>
        value.trim().length > 0 ? true : "Project name cannot be empty",
    });
  }

  if (!argFrontend) {
    questions.push({
      type: "select",
      name: "frontend",
      message: "Which frontend framework would you like to use?",
      choices: [
        { title: "Next.js (v16.3.1)", value: "nextjs", description: "React framework" },
        {
          title: "Angular (v22.1.3)",
          value: "angular",
          description: "Enterprise-grade platform",
        },
        {
          title: "Vue (v3.5.41)",
          value: "vue",
          description: "Progressive JavaScript framework",
        },
        {
          title: "Svelte (v5.56.9)",
          value: "svelte",
          description: "Cybernetically enhanced web apps",
        },
      ],
      initial: 0,
    });
  }

  if (!argBackend) {
    questions.push({
      type: "select",
      name: "backend",
      message: "Which backend framework would you like to use?",
      choices: [
        {
          title: "FastAPI (v0.141.1)",
          value: "fastapi",
          description: "Modern, fast Python web framework",
        },
        {
          title: "Flask (v3.1.3)",
          value: "flask",
          description: "Lightweight Python WSGI web application framework",
        },
        {
          title: ".NET (v10.0.11)",
          value: "dotnet",
          description: "Robust, C#, high-performance framework by Microsoft",
        },
        {
          title: "Node.js Express (v5.2.1)",
          value: "nodejs",
          description: "Minimalist web framework for Node.js",
        },
      ],
      initial: 0,
    });
  }

  const response = await prompts(questions);

  const projectName = argProjectName || response.projectName;
  const frontend = argFrontend || response.frontend;
  const backend = argBackend || response.backend;

  if (!projectName || !frontend || !backend) {
    console.log(pc.red("Setup cancelled."));
    process.exit(1);
  }
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.log(pc.red(`Directory ${projectName} already exists.`));
    process.exit(1);
  }

  console.log(pc.blue(`\nScaffolding project in ${targetDir}...`));

  // Determine paths to templates relative to the CLI script
  const templatesDir = path.resolve(__dirname, "../templates");
  const baseDir = path.join(templatesDir, "base");
  const frontendDir = path.join(templatesDir, "frontend", frontend);
  const backendDir = path.join(templatesDir, "backend", backend);

  try {
    // 1. Copy base template
    await fs.copy(baseDir, targetDir);
    if (fs.existsSync(path.join(targetDir, "gitignore"))) {
      await fs.rename(
        path.join(targetDir, "gitignore"),
        path.join(targetDir, ".gitignore"),
      );
    }

    // 2. Copy frontend
    const targetFrontend = path.join(targetDir, "frontend");
    await fs.copy(frontendDir, targetFrontend);

    // 3. Copy backend
    const targetBackend = path.join(targetDir, "backend");
    await fs.copy(backendDir, targetBackend);

    // 4. Update package.json name for the frontend
    const pkgPath = path.join(targetFrontend, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      pkg.name = `${projectName}-frontend`;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    // 5. Make all shell scripts executable
    const makeExecutable = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          makeExecutable(filePath);
        } else if (file.endsWith(".sh")) {
          fs.chmodSync(filePath, 0o755);
        }
      });
    };
    makeExecutable(targetDir);

    // 6. Install dependencies
    console.log(
      pc.blue("\nInstalling dependencies (this may take a minute)..."),
    );

    // Frontend installation
    console.log(pc.cyan("  Installing frontend dependencies..."));
    execSync("npm ci", { cwd: targetFrontend, stdio: "inherit" });

    if (backend === "fastapi" || backend === "flask") {
      console.log(pc.cyan("  Setting up backend virtual environment..."));
      const pythonCmd = process.platform === "win32" ? "python" : "python3";
      try {
        execSync(`${pythonCmd} -m venv venv`, {
          cwd: targetBackend,
          stdio: "inherit",
        });

        const pipPath =
          process.platform === "win32"
            ? path.join("venv", "Scripts", "pip")
            : path.join("venv", "bin", "pip");

        console.log(pc.cyan("  Installing backend dependencies..."));
        execSync(`${pipPath} install -r requirements.txt`, {
          cwd: targetBackend,
          stdio: "inherit",
        });
      } catch (e) {
        console.error(
          pc.red(
            "  Failed to set up Python virtual environment or install dependencies.",
          ),
        );
        process.exit(1);
      }
    } else if (backend === "dotnet") {
      // Check if .NET 9+ SDK is available
      let dotnetMajor = 0;
      try {
        const version = execSync("dotnet --version", { stdio: "pipe" }).toString().trim();
        dotnetMajor = parseInt(version.split(".")[0], 10);
      } catch {
        dotnetMajor = 0;
      }

      if (dotnetMajor < 10) {
        console.log(pc.yellow(`\n  .NET 10 SDK is required but ${dotnetMajor > 0 ? `v${dotnetMajor} was found` : "dotnet was not found"} on your system.`));

        if (process.platform === "win32") {
          console.log(pc.yellow("  Please install the .NET 10 SDK from: https://aka.ms/dotnet/download"));
        } else {
          const { installDotnet } = await prompts({
            type: "confirm",
            name: "installDotnet",
            message: "Would you like to install the .NET 10 SDK automatically? (uses the official Microsoft install script)",
            initial: true,
          });

          if (installDotnet) {
            console.log(pc.cyan("  Installing .NET 10 SDK (this may take a few minutes)..."));
            try {
              execSync(
                "curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0",
                { stdio: "inherit" }
              );
              // Make the newly installed dotnet available in the current process without a shell restart
              const dotnetRoot = path.join(os.homedir(), ".dotnet");
              process.env.DOTNET_ROOT = dotnetRoot;
              process.env.PATH = `${dotnetRoot}:${process.env.PATH}`;
              console.log(pc.green("  .NET 10 SDK installed successfully."));
              console.log(pc.yellow(`  Add ${dotnetRoot} to your PATH permanently by updating your shell profile (e.g. ~/.zshrc).`));
            } catch (e) {
              console.log(pc.yellow("  Could not install .NET SDK automatically. Please install it from https://aka.ms/dotnet/download"));
            }
          } else {
            console.log(pc.yellow("  Skipping .NET SDK installation. Please install .NET 10 SDK from https://aka.ms/dotnet/download"));
          }
        }
      }

      console.log(pc.cyan("  Restoring .NET dependencies..."));
      try {
        execSync("dotnet restore backend.sln", { cwd: targetBackend, stdio: "inherit" });
      } catch (e) {
        console.log(
          pc.yellow(
            "  Could not restore .NET dependencies automatically. Please make sure .NET 10 SDK is installed and in your PATH.",
          ),
        );
      }
    } else if (backend === "nodejs") {
      console.log(pc.cyan("  Installing Node.js backend dependencies..."));
      execSync("npm ci", { cwd: targetBackend, stdio: "inherit" });
    }

    // 7. Initialize Git repository
    console.log(pc.blue("\nInitializing Git repository..."));
    try {
      execSync("git init", { cwd: targetDir, stdio: "ignore" });
      execSync("git add .", { cwd: targetDir, stdio: "ignore" });
      execSync('git commit -m "Initial commit from create-fullstack-app"', {
        cwd: targetDir,
        stdio: "ignore",
      });
      console.log(pc.cyan("  Git repository initialized."));
    } catch (e) {
      console.log(
        pc.yellow(
          "  Could not initialize Git repository automatically. You may need to run git init yourself.",
        ),
      );
    }

    console.log(pc.green(`\nSuccess! Created ${projectName} at ${targetDir}`));
    console.log("\nInside that directory, you can run several commands:\n");

    console.log(`  ${pc.cyan("./start.sh")}`);
    console.log(
      "    Starts both the backend and frontend development servers.\n",
    );

    console.log(`  ${pc.cyan("./test.sh")}`);
    console.log("    Runs tests for both frontend and backend.\n");

    console.log(`  ${pc.cyan("./lint.sh")}`);
    console.log("    Lints and formats both frontend and backend code.\n");

    console.log("\nWe suggest that you begin by typing:\n");
    console.log(pc.cyan(`  cd ${projectName}`));
    console.log(pc.cyan("  ./start.sh"));
    console.log("\nHappy coding!");
  } catch (error) {
    console.error(pc.red("Error scaffolding project:"), error);
    process.exit(1);
  }
}

main().catch(console.error);
