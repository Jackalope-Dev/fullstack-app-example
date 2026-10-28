# Run and develop: combined workflow for fullstack (root + backend + frontend)

This area defines how to install, start, and develop the React frontend and Node.js/Express backend together from the repository root. It exists to provide a single entry point for running both apps concurrently, while allowing each app to be developed independently when needed.

## Architecture

- Root orchestrator: `package.json` at repo root wires concurrent dev workflow and delegates to backend and frontend.
- Backend app: `backend/` (Express + CORS). Started via nodemon from the root orchestrator.
- Frontend app: `frontend/` (Create React App). Started via `react-scripts` from the root orchestrator using `--prefix`.
- Control flow for `npm start` at root:
  - Spawns two processes in parallel: `npm run server` (backend) and `npm run client` (frontend).
  - Backend entry (nodemon) watches `backend/server.js` (by convention) and restarts on file changes.
  - Frontend entry (CRA) starts the dev server with hot reload.

## Root package.json (./package.json)

Responsibility: Single-command developer workflow and shared dev dependencies for running both servers concurrently.

Key scripts and behavior:
- "start": `concurrently "npm run server" "npm run client"`
  - Entry point for fullstack development. Spawns both backend and frontend. Output is interleaved by concurrently.
- "server": `nodemon backend/server.js`
  - Starts the backend using nodemon. Expects `backend/server.js` to exist and export/start an Express app.
- "client": `npm start --prefix frontend`
  - Starts the frontend by running the `start` script from `frontend/package.json`.

Dependencies used by the workflow:
- `concurrently`: Runs multiple scripts in parallel from a single command.
- `nodemon`: Restarts the backend process on file changes.

Ports and interaction:
- The README documents the expected ports during development:
  - Frontend (CRA): http://localhost:3000
  - Backend (Express): http://localhost:5000
- Cross-origin development is expected; the backend should enable CORS to accept requests from the frontend’s origin.

What happens on change:
- Editing backend files (e.g., `backend/server.js`) triggers nodemon to restart the server process.
- Editing frontend files triggers CRA’s hot reload.

## Backend package.json (./backend/package.json)

Responsibility: Backend app dependencies and local scripts (none defined for starting; start is driven from root).

Important contents:
- Dependencies: `express`, `cors`
  - Backend is an Express server with CORS enabled to support cross-origin requests from the CRA dev server.
- No `start` script is defined here; the backend is started from root via `nodemon backend/server.js`.

Implications:
- The backend entry file is assumed by the root script to be `backend/server.js`.
- If you rename or relocate the backend entry, you must update the root `server` script accordingly.

## Frontend package.json (./frontend/package.json)

Responsibility: Frontend (Create React App) dependencies and scripts.

Key scripts:
- "start": `react-scripts start`
  - Starts the CRA dev server (default on port 3000). Consumed by root via `npm start --prefix frontend`.
- "build": `react-scripts build`
- "test": `react-scripts test`
- "eject": `react-scripts eject`

Runtime behavior:
- CRA serves the React app, provides hot reload, and proxies are not configured here. Calls to the backend should use the full backend URL (e.g., `http://localhost:5000/...`) unless you add a CRA proxy configuration.

## README.md (./README.md)

Responsibility: User-facing guide for setup and run instructions, ports, and how the two apps interact.

Highlights grounded in source:
- Install: `npm install` at root. If needed, install separately in `frontend` and `backend`.
- Start both: `npm start` (runs the root script via `concurrently`).
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:5000`
- Start only backend: `npm run server`
- Start only frontend: `npm run client`
- CORS must be enabled in the backend to allow the frontend to call it across ports (backend `cors` dependency confirms intent).
- Example API route shown in the README references `backend/server.js` and uses `app.get('/api/project', ...)` returning JSON, and frontend fetch example uses `http://localhost:5000/api/project`.

Contracts and data flow:
- Frontend calls backend over HTTP using absolute URLs (no CRA proxy configured here).
- Backend responds with JSON; the README’s example returns fields like `studentName`, `projectName`, `projectUrl`, `projectDescription`.

## Gotchas

- Backend entry path is hardcoded in root script: The root `server` script runs `nodemon backend/server.js`. If your backend entry file isn’t `backend/server.js`, update the root script accordingly or your start will fail.
- Ports are implied, not enforced in scripts: The README states 3000 (frontend) and 5000 (backend). Ensure your backend actually listens on 5000 or update documentation and frontend calls to match. CRA will prompt to use a different port if 3000 is busy; that will break hardcoded frontend fetch URLs unless you adjust them.
- CORS must be enabled in the backend: The cross-origin dev flow requires `cors` middleware in your Express app. If omitted or misconfigured, the frontend will see CORS errors even if the backend endpoint works.
- No CRA proxy configured: Since there is no `proxy` field in `frontend/package.json`, the frontend must call fully-qualified backend URLs. If you add a proxy later, remove hardcoded host/port in frontend code or you’ll get mixed-origin behavior depending on environment.
- Independent node_modules: The root has devDependencies (`concurrently`, `nodemon`) while backend/frontend have their own dependencies. Running `npm install` at root installs only root deps. Install app-specific deps in their respective directories when adding packages.
- Start order and readiness: `concurrently` starts both servers in parallel; the frontend may attempt requests before the backend is ready. Handle retries or conditional rendering in the frontend.