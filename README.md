# create-fullstack-app

A CLI tool for scaffolding a full-stack web application with your choice of frontend and backend technologies.

## Features

- **Frontend Options**: Next.js (More coming soon: Angular, Vue, Svelte)
- **Backend Options**: FastAPI (More coming soon: Flask)
- **Unified Scripts**: `start.sh`, `test.sh`, and `lint.sh` available out of the box to manage both frontend and backend seamlessly.
- **CI/CD Ready**: Includes a pre-configured `.github/workflows/test.yml` that tests both ends. *Tip: To enforce this, enable branch protection in your GitHub repository settings and require the "test" status check to pass.*
- **Developer Experience**: Includes `.vscode/extensions.json` recommending the necessary linters and formatters.

## Quickstart

Run the CLI tool using Node.js:

```bash
cd cli
npm install
npm link
create-fullstack-app
```

Or run directly without linking:

```bash
cd cli
npm install
node index.js
```

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
│   ├── app/
│   ├── package.json
│   └── next.config.js
├── start.sh
├── test.sh
└── lint.sh
```
