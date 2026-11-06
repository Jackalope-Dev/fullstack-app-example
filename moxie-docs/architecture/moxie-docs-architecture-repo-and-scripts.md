# Repository root scripts and package relationships

This area documents how the repository’s root package.json orchestrates development and build workflows across backend and frontend packages, and how the top-level scripts and package boundaries fit together so you can run, build, and ship reliably.

## Architecture

At the repository root, a single package.json defines scripts that coordinate workspaces for the backend and frontend. These scripts are the primary entry points for local development, CI builds, and distribution. Control typically enters through `npm run <script>` at the root, which then fans out to workspace-specific scripts. Data and artifacts flow upward: each workspace builds into its own output directory, and root scripts combine or sequence those builds.

High-level map:
- Root package.json: owns orchestration scripts for dev, build, test, lint, and type-check.
- Backend package(s): expose scripts like `dev`, `build`, `start`, `test` consumed by the root.
- Frontend package(s): expose scripts like `dev`, `build`, `start`, potentially framework-specific commands (e.g., Next.js, Vite) invoked by the root.
- Shared configuration (linters, TS config) lives at the root and is referenced by workspaces.

## Root package.json (scripts and orchestration)

Entry point: running `npm run <script>` at the repository root.

Responsibilities:
- Provide a single surface for common developer tasks.
- Fan out to workspace scripts in backend and frontend packages.
- Enforce consistent linting, type-checking, and test execution across packages.

Typical script roles you will find at the root:
- dev: concurrently runs the backend and frontend dev servers, wiring environment and port coordination.
- build: runs workspace builds in the right order (e.g., shared libs → backend → frontend) to produce deployable artifacts.
- start: launches the production server(s) using built artifacts; often delegates to a backend `start` script and serves the frontend’s static build.
- test: runs test suites across all workspaces (unit/integration) with shared reporters/coverage.
- lint and format: apply repo-wide linting/formatting rules across all packages.
- typecheck: validates TypeScript in all workspaces using shared tsconfig.

Control flow:
- dev: root invokes each workspace’s `dev` script, often via a concurrency tool. Frontend and backend watch their sources and rebuild on change.
- build: root calls each workspace `build` serially to respect dependencies; shared libs (if any) build first.
- start: root calls backend `start` and, if applicable, serves frontend build output. Environment variables are read at this stage.

Side effects:
- Creates workspace-specific build outputs (e.g., dist/.next/build).
- Populates shared cache directories if build caching is enabled.
- Produces coverage and lint reports in standardized locations, typically at the root or within each workspace.

## Backend package(s)

Responsibility:
- Provide the API/server runtime. Exposes scripts consumed by root: `dev`, `build`, `start`, `test`.

Behavioral notes:
- `dev` usually runs a watch mode (e.g., ts-node-dev, nodemon) and may depend on generated code from shared libs. Ensure build order or codegen is satisfied before `start`.
- `build` compiles TS to JS and prepares production artifacts.
- `start` runs the compiled server; it should not depend on TS sources.
- `test` executes unit/integration tests; may spin up ephemeral resources (DB, queues) based on env.

Contracts:
- Ports and API base paths should be stable for the frontend dev server proxy.
- If the backend exports a typed client or shared schemas, ensure the build makes them available before the frontend build step.

## Frontend package(s)

Responsibility:
- Provide the web UI. Exposes scripts consumed by root: `dev`, `build`, `start` (or `preview`), `test` (if applicable).

Behavioral notes:
- `dev` starts the framework dev server (hot reload), often proxying API requests to the backend dev server.
- `build` generates static/SSR artifacts.
- `start` or `preview` serves the production build for local verification.

Contracts:
- Expects the backend dev server to be reachable at a known URL during `dev`.
- During `build`, may require env variables (public runtime config) to be present.

## Shared configuration and tooling

- Linting/formatting: Root provides ESLint/Prettier configs applied across workspaces via root scripts.
- TypeScript: A root tsconfig base is extended by package-level tsconfigs to ensure consistent compiler options.
- Package interop: Workspaces reference each other via workspace protocol versions; changes in shared packages require rebuilds of dependents.

## Gotchas

- Script ordering: If shared libraries generate code or types consumed by backend/frontend, ensure the root `build` runs them first. Running `npm run build` directly inside a dependent package can fail if prerequisites aren’t built.
- Environment parity: `dev` and `start` often read different env files; verify that required variables are set for both local dev and production runs.
- Port collisions: The `dev` script commonly starts multiple servers; ensure ports are unique and updated consistently across backend and frontend configs when changed.
- Cache staleness: Monorepo build caches can mask broken dependencies; clear caches if you see inexplicable runtime mismatches between packages.
- Cross-package imports: Use workspace versions and avoid deep relative imports across packages; otherwise TS path aliases and runtime resolution can diverge.