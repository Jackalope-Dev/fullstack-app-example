# Backend server.js — Express API and health endpoint

This area contains a minimal Express-based HTTP server that provides a simple JSON API consumed by the frontend and a health probe endpoint. It centralizes CORS configuration, JSON body parsing, and port selection via the `PORT` environment variable.

## Architecture

- Entry point: `backend/server.js` instantiates an Express app and starts listening.
- Dependencies: `express` for routing/middleware, `cors` for cross-origin requests; declared in `backend/package.json`.
- Middleware stack (in order):
  - `cors()` (allows all origins by default)
  - `express.json()` (parses JSON request bodies)
- Routes:
  - `GET /api/project` returns static project metadata as JSON
  - `GET /healthz` returns plain text OK for health checks
- Process config: `PORT` env var, default `5000`.

## backend/server.js

Responsibility
- Bootstraps an Express server, configures CORS and JSON parsing, defines two routes, and starts listening on the configured port.

Control and data flow
- Process starts: `const app = express();` and selects `PORT = process.env.PORT || 5000`.
- Middleware:
  - `app.use(cors());` allows cross-origin requests from any origin. A commented block illustrates how to restrict origin/methods if needed.
  - `app.use(express.json());` attaches JSON body parsing for downstream routes (current routes are GET-only and do not consume bodies, but this enables future POST/PUT routes to read `req.body`).
- Routes:
  - `GET /api/project`
    - Path: `/api/project`
    - Methods: GET
    - Auth: None; no authentication or authorization is implemented.
    - Inputs: No path params, query params, or request body are read.
    - Response: `200 OK` with JSON payload:
      {
        studentName: "Smith, John",
        projectName: "Weather App",
        projectUrl: "http://10.0.0.1:3000/",
        projectDescription: "This application provides real-time weather updates for any location worldwide."
      }
    - Errors: None explicitly handled; default Express error handling would apply if an unexpected exception occurs (not expected in current static response).
    - Side effects: None.
  - `GET /healthz`
    - Path: `/healthz`
    - Methods: GET
    - Auth: None.
    - Inputs: None.
    - Response: `200 OK` with plain text body `OK` (via `res.send('OK')`). Content-Type will be `text/html; charset=utf-8` by Express default for string sends, which is acceptable for health checks.
    - Errors: None explicitly handled.
- Server start: `app.listen(PORT, () => { console.log(
    \`Server running on port ${PORT}\`
  ); });`

Client interactions
- Frontend or external clients can call `GET {server-origin}/api/project` to retrieve project metadata for display.
- Liveness probes or monitoring can call `GET {server-origin}/healthz` to confirm process responsiveness.

## backend/package.json

- Declares runtime dependencies used by `server.js`:
  - `express@^4.21.1`
  - `cors@^2.8.5`
- Scripts: Only a placeholder `test` script is defined; there is no start script here. Consumers should run the server with a Node command, e.g., `node backend/server.js`, or define an appropriate `start` script.
- Main is `index.js`, but this is unused by the current setup; `server.js` is the actual entrypoint.

## API details

- Base URL: This server binds to `http://0.0.0.0:{PORT}` as determined by Node/Express default; external reachability depends on deployment. Default port is `5000` unless `PORT` is set.

- Endpoint: GET /api/project
  - Request: No auth or parameters.
  - Response: 200 with JSON body shown above.

- Endpoint: GET /healthz
  - Request: No auth or parameters.
  - Response: 200 with body `OK`.

## Gotchas

- CORS configuration: `app.use(cors())` allows all origins and methods by default. If the frontend must be restricted (e.g., to `http://localhost:3000`) or methods limited, replace with the commented configuration block in `server.js`. Be careful to include all methods your frontend uses (e.g., `OPTIONS` for preflight, `GET`, `POST`). Overly restrictive settings can break browsers with CORS errors.

- Port selection: The server depends on `process.env.PORT` when present; ensure your deployment sets it, or expect port `5000`. Port conflicts will prevent startup.

- Content types: `/api/project` uses `res.json(...)` which sets `application/json`. `/healthz` uses `res.send('OK')`, resulting in a text response. If your health checker expects JSON, adjust accordingly.

- Lack of auth and validation: All routes are public and accept cross-origin access. Do not add sensitive data without implementing authentication/authorization and tightening CORS.

- Missing start script: Since `package.json` lacks a `start` script, some tooling may not auto-run the server. Use `node backend/server.js` or add a script before relying on package scripts.