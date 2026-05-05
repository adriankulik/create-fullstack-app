# create-fullstack-app

A CLI tool for scaffolding a full-stack web application with your choice of frontend and backend technologies.

## Features

- **Frontend Options**: Next.js, Angular, Vue, Svelte
- **Backend Options**: FastAPI, Flask
- **Unified Scripts**: `start.sh`, `test.sh`, and `lint.sh` available out of the box to manage both frontend and backend seamlessly.
- **CI/CD Ready**: Includes a pre-configured `.github/workflows/cli-e2e.yml` that tests both ends. *Tip: To enforce this, enable branch protection in your GitHub repository settings and require the "test" status check to pass.*
- **Developer Experience**: Includes `.vscode/extensions.json` recommending the necessary linters and formatters.

## Quickstart

Run the CLI tool directly using Node.js:

```bash
cd cli
npm install
node index.js
```

You will be prompted to choose a project name, your preferred frontend, and backend framework.

## Generated Project

The generated application will look like this:

```
my-app/
├── .github/
├── .vscode/
├── backend/
│   ├── main.py
│   ├── test_main.py
│   └── requirements.txt
├── frontend/
│   ├── app/ (or src/)
│   └── package.json
├── start.sh
├── test.sh
└── lint.sh
```

*Note: Depending on your environment, you may need to ensure the generated shell scripts are executable by running `chmod +x *.sh` inside your new project directory.*

## Local E2E Testing

You can automatically test all frontend and backend permutations locally via **Playwright** integration tests using the provided script in the root directory.

Ensure you make the script executable first:

```bash
chmod +x run_e2e.sh
```

Then run it:

```bash
./run_e2e.sh
```

**Note for Windows Users:** The `run_e2e.sh` script utilizes Unix commands (like `lsof` and `kill -9`) for process teardown. You must run this script inside a **WSL** (Windows Subsystem for Linux) or **Git Bash** terminal.

## Roadmap

Future plans for this CLI include:

- Adding frontend framework-specific component libraries during the scaffold step.
- Tackling **.NET** as a new backend option.
