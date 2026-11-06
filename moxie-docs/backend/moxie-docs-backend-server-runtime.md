# Backend server runtime and process control

This area documents how the Node.js backend server is started and controlled at runtime: the entry points, environment/ports it honors, and how to run it in development versus production using the repository’s scripts.

## Architecture

- Entry points: The backend server process is started by the package scripts defined in this repository. Development generally uses a watch/reload runner; production uses a compiled/bundled or direct Node execution.
- Environment: Standard Node runtime environment variables (e.g., PORT, NODE_ENV) are read by the server code and/or process manager to decide the bind address, logging verbosity, and feature flags.
- Control flow:
  - Dev: script runs a watch mode, starts the HTTP server, and restarts on changes.
  - Prod: script executes the built server artifact once, usually without autoreload.
- Ports: The server binds to the PORT environment variable when provided; otherwise it falls back to a default baked into the server code.

## moxie-docs/backend/server-runtime.md

This document is the maintainer-facing reference for backend server lifecycle and runtime knobs. It explains:
- How the Node server is started in both development and production.
- Which environment variables affect runtime (e.g., PORT, HOST, NODE_ENV).
- The difference between local development runs (autoreload, debug logging) and production runs (single start, structured logging).
- How to use the repository’s package scripts to start, stop, and build the server.

Because this file is documentation-only, there are no runtime side effects; it should be kept in sync with the server’s actual startup scripts and any process manager configuration (e.g., PM2, Docker, systemd) utilized by the project.

### Development startup
- Command: Use the dev script defined in the package manager (e.g., `npm run dev` or `pnpm dev`). This starts the server with hot reload.
- Environment:
  - NODE_ENV=development (default when using dev scripts)
  - PORT can override the listen port. If unset, the dev default in code is used.
- Behavior: The process restarts automatically on code changes; stack traces and verbose logs are enabled.

### Production startup
- Build: Run the build script (e.g., `npm run build`) to produce the server artifact.
- Start: Use the start script (e.g., `npm start`) to launch the compiled server.
- Environment:
  - NODE_ENV=production
  - PORT must be set explicitly in most deployments; otherwise the server falls back to its internal default.
  - HOST may be honored if the server supports binding to a specific interface.
- Behavior: Single-run process without autoreload; logging is typically structured/concise.

### Common scripts and expectations
- dev: Starts the server in watch mode.
- build: Produces the production artifact.
- start: Launches the production server.
- test: Runs backend tests; may spin up a test server with its own port.

## Gotchas
- Port conflicts: If PORT is not set or conflicts with another local service, the server will fail to bind. Set PORT to an available value.
- NODE_ENV drift: Running the dev server with NODE_ENV=production can disable useful dev tooling; conversely, running production with NODE_ENV!=production can enable verbose logging and reduce performance.
- Missing build: In production, ensure `build` has been run before `start` if the start script expects compiled output. Otherwise, the process may crash due to missing artifacts.
- Environment sourcing: Confirm that environment variables are exported in the shell or configured in the process manager; otherwise defaults may be used unexpectedly.
- Hot reload limitations: In dev, changes to certain files (e.g., environment, process bootstrap) may require a manual restart if the watcher does not capture them.