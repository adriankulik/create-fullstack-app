# Your Fullstack Application

> 🚀 This application was scaffolded using [create-fullstack-app](https://github.com/adriankulik/create-fullstack-app) by Adrian Kulik.

## Quickstart

This project is set up with unified shell scripts to easily manage both the frontend and backend simultaneously.

### Prerequisites

These scripts natively support **macOS** and **Linux**. If you are using **Windows**, you must use a Unix compatibility layer like **Git Bash** or **WSL** (Windows Subsystem for Linux) to run them.

Depending on your environment, you may need to ensure the scripts are executable before running them for the first time:

```bash
chmod +x *.sh
```

### Running the App
  
Builds and starts all three tiers (frontend, backend, database + migration) in isolated Docker containers, and automatically reopens your IDE (Cursor or VS Code) directly inside the DevContainer:

```bash
./start.sh
```

*(Pass `--no-open` to skip opening the editor, or `-d` to run detached).*

**Database Note:** Ensures **PostgreSQL (v15)** is running and automatically executes **Alembic** migrations before serving your app.

### Isolated AI Sandbox & Egress Security (Pipelock)

This repository includes a secure, self-contained AI sandbox for running autonomous coding agents (Antigravity, Claude Code, OpenCode):

```bash
./sandbox.sh
```

* **Containment**: Traps the agent within `/workspace`. The host filesystem, home directory, SSH keys, and system files cannot be accessed or deleted.
* **Secret Protection**: Developer secrets in `.env.local` or `.env.secrets` are masked with empty mounts inside the container, preventing the AI from reading them.
* **Pipelock AI Firewall**: All outbound network traffic is mediated by [Pipelock](https://github.com/luckyPipewrench/pipelock) (`pipelock:8888`), which scans for secret exfiltration (65+ DLP patterns), blocks SSRF to cloud metadata endpoints, and produces signed audit receipts.
* **DevContainer Ready**: Open this folder in VS Code, Cursor, or OpenCode and select **"Reopen in Container"** to work inside `.devcontainer/`.

### Testing and Linting

- **Test:** Run all frontend and backend tests:
  ```bash
  ./test.sh
  ```

- **Lint:** Lint and format your codebase:
  ```bash
  ./lint.sh
  ```

## AI Development Friendly

This repository is optimized for development with AI agents:
- **`AGENTS.md`**: Provides behavioral guidelines and critical instructions to constrain and guide the AI.
- **`ACCESSIBILITY.md`**: Provides accessibility guidelines and constraints to guide the AI's implementations.
- **`.agents/skills/`**: Includes an extensive set of agent skills sourced from [claude-skills](https://github.com/alirezarezvani/claude-skills).

<details>
<summary>Included Agent Skills</summary>
<ul>
  <li><b>senior-frontend</b>: Includes scripts for component generation, frontend scaffolding, and bundle analysis.</li>
  <li><b>senior-fullstack</b>: Provides tools for fullstack scaffolding, project setup, and code quality analysis.</li>
  <li><b>senior-qa</b>: Contains utilities for test suite generation, E2E test scaffolding, and coverage analysis.</li>
  <li><b>accessibility-general</b>: Guidelines and tools for ensuring WCAG 2.2 accessibility compliance.</li>
</ul>
</details>

## Acknowledgements

- [Docker](https://www.docker.com/) (Apache License 2.0)
- [Pipelock](https://github.com/luckyPipewrench/pipelock) (Apache License Version 2.0, January 2004)
