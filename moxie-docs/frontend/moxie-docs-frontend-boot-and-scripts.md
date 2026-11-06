# Frontend boot behavior and dev/prod scripts

This page explains how the frontend boots in the browser and how to run, build, and ship it via the project’s npm scripts. It exists to give maintainers a single place to understand local dev entry points, production build outputs, and the commands that wire everything together.

## Architecture

- Entry point: The browser entry file (commonly `index.js` or `src/index.js`) mounts the root application into the DOM and wires up global providers (router, state, theming) before rendering.
- Build system: The `package.json` scripts drive local development (watch server with HMR), type checks/linting, and production builds (optimized bundles). The build usually emits static assets consumed by the production server or static host.
- Environments: Dev runs with source maps and hot reloading; production builds are minified/optimized and may rely on environment variables injected at build time.

## Browser entry (index.js)

Responsibility
- Mounts the application’s root component into the DOM, typically by selecting a root element (e.g., `document.getElementById('root')`).
- Initializes and composes global providers (router, state/store, query client, i18n, error boundaries) before rendering the app tree.
- May register service workers, set up performance metrics, and attach global error listeners.

Control/data flow
- The DOM is the control entry. The script runs once the bundle loads, selects the root node, and renders the app component tree.
- Routing is initialized before the first render; route changes are client-driven after boot.
- Any bootstrap configuration (e.g., reading `process.env`-injected values) occurs synchronously before initial render.

Key behaviors to look for in the source
- Root container lookup and a hard failure or fallback if it’s missing.
- Conditional mounts for development helpers (e.g., React StrictMode) enabled only in development.
- Optional service worker registration guarded by environment checks.

Side effects and contracts
- Assumes the HTML shell includes a stable root node id.
- Expects any required environment variables to be present at build time and reachable via the bundler’s env mechanism.

What would bite you if you change this
- Renaming the root DOM id without updating the HTML shell will prevent the app from mounting.
- Moving provider initialization can break routing, state hydration, or server data prefetching.
- Enabling service workers in development without care can cause stale asset caches; always gate by environment.

## package.json scripts

Responsibility
- Single source of truth for how to run, lint, test, build, and preview the app in different environments.

Common scripts you will find and how they interact
- dev/start: Launches the development server with hot module reloading. Watches source files and rebuilds incrementally.
- build: Produces an optimized production bundle. Fails the build on type/lint errors if configured.
- preview/serve: Serves the production build locally to validate the output bundle.
- lint/typecheck/test: Static analysis and tests usually run locally and in CI before build/deploy.

Control flow
- CI commonly runs: install → lint/typecheck/test → build. Local development uses dev/start only.
- Environment variables may be read by scripts (e.g., `NODE_ENV=production npm run build`) and injected into bundles.

Outputs
- A production build emits versioned assets (JS/CSS) into the configured output directory. These are the artifacts deployed to hosting.

What would bite you if you change this
- Renaming scripts without updating CI workflows or developer docs will break pipelines and local onboarding.
- Changing the output directory requires updating the production server/static host configuration.
- Introducing required env vars without defaults will crash dev servers or produce incorrect production builds.

## Gotchas

- Root element mismatch: Ensure the HTML template’s root id matches what the entry file queries; otherwise, the app won’t mount.
- Stale caches: If a service worker is used, bump asset hashes and consider versioned cache names to prevent clients serving old bundles after deploy.
- Env parity: Some features may be behind environment checks; verify both dev and production code paths during testing.
- CI coupling: Keep `package.json` scripts stable or coordinate changes with CI configuration to avoid broken pipelines.