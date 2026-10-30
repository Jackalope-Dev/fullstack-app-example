# Monorepo run scripts and dev workflow (root, frontend, backend)

This area defines how you install dependencies and run the React frontend and Node/Express backend together or separately using the root-level npm scripts. It exists to centralize the day-to-day dev workflow so you don’t have to cd into each app for common tasks.

## Architecture

- Entry points
  - Root scripts in `package.json` orchestrate both apps:
    - `start` runs frontend and backend concurrently
    - `server` runs only the backend (via nodemon)
    - `client` runs only the frontend (delegates to `frontend`)
- Apps
  - `frontend/` is a Create React App (CRA) app managed by `frontend/package.json`
  - `backend/` is an Express server managed by `backend/package.json`
- Dev tooling
  - `concurrently` runs multiple processes from the root
  - `nodemon` restarts the backend server on file changes
- Network defaults (per README)
  - Frontend runs on http://localhost:3000
  - Backend runs on http://localhost:5000

## Root package.json (./package.json)

Responsibility: Centralizes dev scripts that operate both apps, and provides dev-time process management dependencies.

Key scripts
- "start": "concurrently \"npm run server\" \"npm run client\""
  - Spawns two processes: the backend watcher and the frontend dev server.
- "server": "nodemon backend/server.js"
  - Starts the Express server with live-reload; expects an entry file at `backend/server.js`.
- "client": "npm start --prefix frontend"
  - Runs the CRA dev server defined in `frontend/package.json` from the root.

Dev dependencies
- concurrently: ^8.2.0 — used by `npm start` to run multiple scripts
- nodemon: ^3.0.1 — used by `npm run server` for auto-restart on backend file changes

Control/data flow
- When you run `npm start` at the root, `concurrently` launches:
  - nodemon -> `backend/server.js` (serves API on port 5000 per README)
  - CRA dev server -> frontend on port 3000 (proxied CORS per README context)
- The frontend issues HTTP requests to the backend (example route in README at `/api/project`).

Common tasks
- Install all deps: `npm install` (from root). This installs root devDeps and each app’s deps via nested package.json resolution.
- Run both apps: `npm start` (from root)
- Backend only: `npm run server` (from root)
- Frontend only: `npm run client` (from root)

## Backend package.json (./backend/package.json)

Responsibility: Declares server dependencies and optional scripts for the backend app.

- Dependencies
  - express: ^4.21.1
  - cors: ^2.8.5
- Scripts
  - "test": placeholder that exits with error (no test runner is configured)

How it fits
- The backend is started by the root script: `nodemon backend/server.js`. The backend’s own `package.json` does not define a `start` script; the root controls startup.
- CORS is available to be configured in server code (per README). Expect API to listen on port 5000 and expose routes like `/api/project`.

What to change carefully
- If you rename or move `backend/server.js`, update the root `server` script accordingly.
- Adding backend-only scripts (e.g., `start`, `dev`) won’t be picked up by root unless you also update root scripts or run them from `backend/` directly.

## Frontend package.json (./frontend/package.json)

Responsibility: Manages the CRA-based frontend app lifecycle scripts and dependencies.

- Scripts
  - "start": "react-scripts start" — dev server on port 3000
  - "build": "react-scripts build"
  - "test": "react-scripts test"
  - "eject": "react-scripts eject"
- Dependencies include React 18.x and CRA tooling.

How it fits
- The root `client` script shells to `npm start --prefix frontend`, which runs this file’s `start` script.
- Use `npm run build` inside `frontend/` to create a production build; there’s no root alias for build.

What to change carefully
- If you change the dev server port or CRA config, update any hardcoded URLs used by the backend or docs. The README assumes `http://localhost:3000`.

## Top-level README (./README.md)

Responsibility: Explains the project structure and expected dev workflow, including installation and the default ports. It documents example API usage and CORS expectations.

Key behaviors documented
- Install all deps from root: `npm install` (if issues, install inside each app)
- Run both apps: `npm start`
- Run backend only: `npm run server`
- Run frontend only: `npm run client`
- Default dev URLs
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000
- Example Express route and a `fetch` example from the frontend to `/api/project` on port 5000

## Frontend README (./frontend/README.md)

Responsibility: Standard CRA help text for running, testing, and building the frontend app in isolation.

Use it when
- You are working only inside `frontend/` and want CRA-specific guidance (`npm start`, `npm test`, `npm run build`, `npm run eject`). Root scripts already cover `start` for dev.

## How to install, develop, and test

- Install everything
  - From the repo root: `npm install`
  - If root install fails, run `npm install` separately in `frontend/` and `backend/`
- Develop both apps together
  - From root: `npm start`
  - Backend auto-reloads via nodemon; frontend hot-reloads via CRA
- Develop backend only
  - From root: `npm run server`
- Develop frontend only
  - From root: `npm run client`
  - Or from `frontend/`: `npm start`
- Test
  - Frontend: from `frontend/`, run `npm test`
  - Backend: no test setup provided; the only defined script is a placeholder that exits non-zero

## Gotchas

- Backend entry path is hardcoded in root scripts as `backend/server.js`. Moving or renaming this file will break `npm run server` and `npm start` until you update the root script.
- There is no workspace configuration (e.g., npm workspaces) declared in root `package.json`; root `npm install` relies on nested package discovery. If dependency installation fails at root, install in `frontend/` and `backend/` separately as the README advises.
- Port assumptions are baked into docs and examples (3000 for frontend, 5000 for backend). If you change ports, update any hardcoded URLs in your code and documentation.
- Backend tests are not configured; the backend `test` script exits with an error. Running `npm test` at the root will not run backend tests and may produce confusing output if you expect them to exist.
- CORS must be enabled in backend server code for cross-port local development (as described in README). If you remove or misconfigure CORS, frontend requests from port 3000 will fail.