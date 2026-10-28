# Frontend build, start-up, and environment contracts

This area documents how the React frontend is started and built, what tooling and scripts are involved, and the runtime entry point and side effects. It exists to make maintainers productive quickly when running, building, or modifying the frontend and its bootstrapping code.

## Architecture

- Entry point: `frontend/src/index.js` creates the React root and renders the `App` component inside `React.StrictMode`, and initializes web vitals reporting via `reportWebVitals()`.
- Tooling and scripts: `frontend/package.json` defines dependencies (React 18, react-scripts) and the `npm` scripts (`start`, `build`, `test`, `eject`) that drive local dev, CI, and production builds.
- Developer guide: `frontend/README.md` is the Create React App (CRA) reference for how to run, build, test, eject, and tune the app.
- Maintainer doc: `moxie-docs/frontend/build-and-env.md` is reserved for focused maintainer guidance specific to how this app starts/builds and environment usage.

## frontend/package.json

This file defines the app’s dependencies, build/test/dev scripts, and browserslist targets. It drives how the frontend is executed in dev and built for production.

- Name/version/private:
  - "name": "frontend"
  - "version": "0.1.0"
  - "private": true
- Dependencies:
  - React runtime: "react": "^18.3.1", "react-dom": "^18.3.1"
  - CRA tooling: "react-scripts": "5.0.1"
  - Testing: "@testing-library/react": "^13.4.0", "@testing-library/jest-dom": "^5.17.0", "@testing-library/user-event": "^13.5.0"
  - Metrics: "web-vitals": "^2.1.4"
- Scripts (entry points for day-to-day tasks):
  - `npm start` → `react-scripts start`
    - Runs the development server with live reload on the CRA defaults (typically http://localhost:3000).
  - `npm run build` → `react-scripts build`
    - Creates a production build in the `build` directory, with minified assets and hashed filenames.
  - `npm test` → `react-scripts test`
    - Launches the Jest-based test runner in watch mode.
  - `npm run eject` → `react-scripts eject`
    - One-way operation to copy CRA configs locally (webpack, Babel, ESLint); subsequent scripts use the copied configs.
- ESLint configuration:
  - Extends `react-app` and `react-app/jest` presets.
- Browserslist targets:
  - Production: `>0.2%`, `not dead`, `not op_mini all`
  - Development: last 1 version of Chrome/Firefox/Safari

Operational implications:
- The build pipeline and dev server behavior are controlled by `react-scripts` 5.0.1. Any custom webpack/Babel config requires ejecting.
- Test expectations and DOM assertions are aligned to Testing Library versions pinned above.

## frontend/src/index.js

This is the runtime entry point for the React application. It mounts the root component and wires in web vitals reporting.

Key behavior and control flow:
- Imports and dependencies:
  - `import React from 'react'`
  - `import ReactDOM from 'react-dom/client'` (React 18 root API)
  - `import './index.css'` (global stylesheet; included by bundler)
  - `import App from './App'` (top-level application component)
  - `import reportWebVitals from './reportWebVitals'` (performance reporting hook)
- Root creation and render:
  - `const root = ReactDOM.createRoot(document.getElementById('root'));`
  - `root.render(<React.StrictMode><App /></React.StrictMode>);`
    - Ensures `App` is rendered within `StrictMode` for additional development checks.
- Performance reporting:
  - The file calls `reportWebVitals();` unconditionally. Inline comment documents optional usage: pass a function (e.g., `reportWebVitals(console.log)`) to log results or send to an analytics endpoint.

Side effects and contracts:
- Requires a DOM element with id `root` present in the host HTML (CRA provides this in `public/index.html`).
- `reportWebVitals()` executes; by default it has no output unless the implementation forwards metrics.

What’s not here:
- There is no environment variable handling or API URL selection in this file. Any such logic would live in other modules/components.

## frontend/README.md

This is the standard Create React App README and serves as developer-facing guidance for running and maintaining the app.

Key guidance it codifies (mirrors the actual scripts in `package.json`):
- `npm start`: runs the dev server; view the app at http://localhost:3000. Auto-reload on changes; lint errors appear in console.
- `npm test`: runs tests in interactive watch mode and links to CRA docs for running tests.
- `npm run build`: generates an optimized production build in `build` with minification and hashed filenames; links to CRA deployment docs.
- `npm run eject`: one-way operation to expose config files; subsequent scripts reference the copied configs.
- Additional CRA references: code splitting, bundle analysis, PWA, advanced config, deployment, and troubleshooting.

These instructions align with the concrete scripts and dependencies declared in `frontend/package.json`.

## moxie-docs/frontend/build-and-env.md

This path is reserved for focused maintainer documentation about how the frontend starts, builds, and uses environment variables in relation to the backend API. Keep content in this file grounded in:
- The execution and build scripts defined in `frontend/package.json`.
- The runtime bootstrapping behavior in `frontend/src/index.js` (React 18 root creation, `StrictMode`, and web vitals reporting).
- Any environment variable usage that is implemented in the codebase (e.g., references to `process.env.*` in source files), including how those values affect build-time vs run-time behavior under `react-scripts`.

If you add or modify environment variable dependencies, document:
- The exact variable names expected by `react-scripts` (such as `REACT_APP_*`), where they are read, and their default/required values.
- How the dev server (`npm start`) vs production build (`npm run build`) pick up these variables.
- Any backend URL targeting logic and how it changes across environments.

## Gotchas

- Eject is irreversible: running `npm run eject` permanently replaces `react-scripts` with local config. Commit discipline and CI/CD updates will be required after ejecting.
- React 18 root API: `ReactDOM.createRoot` is used; migrating to legacy APIs (or vice versa) requires coordinated changes across hydration/server rendering if introduced elsewhere.
- Web vitals reporting: `reportWebVitals()` is invoked. If you start logging or sending metrics (by passing a function), verify PII and performance overhead considerations.
- Browserslist impact: altering the `browserslist` in `frontend/package.json` changes transpilation/polyfills and can affect bundle size and compatibility.