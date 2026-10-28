# Frontend environment variables: how they are defined and reach the code

This area documents how environment variables are recognized by the Create React App (CRA)-based frontend and how they become available to runtime code. It exists to clarify which variables are picked up by the tooling, when they are injected, and where the current code consumes them.

## Architecture

- Tooling and runtime:
  - `frontend/package.json` defines the app as a CRA project via `react-scripts` and exposes the standard CRA scripts (`start`, `build`, `test`, `eject`). CRA controls environment variable exposure and injection at build and dev-server time.
  - `frontend/src/index.js` is the React entry point. It renders `<App />` and initializes web vitals via `reportWebVitals()`. In the current code, it does not read or reference any environment variables.
  - `frontend/README.md` is the stock CRA README, which implies standard CRA environment behavior and lifecycle.
- Data/control flow for env vars:
  - At `npm start`/`npm run build` time, `react-scripts` reads environment variables from the shell and `.env*` files and statically inlines any prefixed variables that CRA exposes into the bundle.
  - Runtime code can access those variables through `process.env.VAR_NAME` (evaluated at build time by CRA).

## frontend/package.json

Responsibility: Declares the CRA app and the scripts that govern when and how environment variables are read and injected.

Key points from the file:
- Dependencies include `react-scripts@5.0.1`, which is the mechanism that recognizes and injects environment variables during `start` and `build`.
- Scripts:
  - `start`: `react-scripts start`
  - `build`: `react-scripts build`
  - `test`: `react-scripts test`
  - `eject`: `react-scripts eject`

Environment variable behavior driven by `react-scripts`:
- Variables are read from the shell and optional `.env` files at command invocation time. CRA supports multiple files such as `.env`, `.env.local`, `.env.development`, `.env.production`, and their `.local` variants; these are merged according to CRA rules during `start`/`build`.
- Only variables with the `REACT_APP_` prefix are exposed to the client bundle. Unprefixed variables are not available in browser code.
- `NODE_ENV` is set by the scripts (`development` for `start`, `production` for `build`) and can be used in code but should not be manually overridden.

Common patterns enabled by this setup (available to the code if added):
- API base URL: `REACT_APP_API_BASE_URL`
- Feature flags: `REACT_APP_FEATURE_X_ENABLED`
- Analytics keys: `REACT_APP_ANALYTICS_KEY`

These will be accessible in code as `process.env.REACT_APP_API_BASE_URL`, etc., after being inlined by the build.

## frontend/src/index.js

Responsibility: The application entry point that mounts the React tree and initializes web vitals.

Content overview and behavior:
- Renders the app:
  - Creates a root via `ReactDOM.createRoot(document.getElementById('root'))`.
  - Renders:
    ```js
    <React.StrictMode>
      <App />
    </React.StrictMode>
    ```
- Performance reporting:
  - Calls `reportWebVitals()` at the bottom of the file. Inline comment notes that you can pass a logger (e.g., `reportWebVitals(console.log)`) or send metrics to an analytics endpoint.

Environment variables in this file:
- No `process.env.*` usage exists in this file as currently implemented.
- Because this is the composition root, it is a typical point to add environment-driven configuration for the app (e.g., pass `process.env.REACT_APP_*` values as props or via context). To do so safely, ensure variables are prefixed with `REACT_APP_` and read them synchronously at module init time so CRA can inline them.

## frontend/README.md

Responsibility: The stock CRA README that documents the lifecycle and commands used by the frontend. While it does not list specific environment variables, it implies the standard CRA environment model tied to `react-scripts`.

Relevant aspects:
- Describes `npm start`, `npm test`, and `npm run build`, which are the touchpoints where CRA reads and injects environment variables.
- Links to CRA documentation where advanced configuration (including `.env` usage and variable exposure rules) is covered.

## Using environment variables in this frontend

- Prefixing requirement: Only variables starting with `REACT_APP_` are exposed to the browser bundle. Example: `REACT_APP_API_BASE_URL=https://api.example.com`.
- Access in code: Use `process.env.REACT_APP_API_BASE_URL` (or another `REACT_APP_*` variable) in application code. CRA replaces these at build time.
- Environment files: Place variables in `.env`, `.env.development`, `.env.production`, and optional `.local` variants at the repository root of the `frontend` app. For local development, `.env.local` is not committed and overrides others.
- Build-time nature: Values are captured at build or dev-server startup. Changing the shell or `.env` after `npm start` requires restarting the dev server; after `npm run build` requires a rebuild.

## Gotchas

- Missing prefix: Unprefixed variables (e.g., `API_BASE_URL`) will not be available in browser code; use `REACT_APP_API_BASE_URL`.
- Runtime vs build time: Environment variables are inlined at build time by CRA. They are not dynamically read at runtime from the host environment after the bundle is served.
- Type coercion: All `process.env.REACT_APP_*` values are strings. Parse to numbers/booleans in code if needed.
- Secrets: Anything exposed via `REACT_APP_*` will be shipped to the browser. Do not put secrets or private keys in these variables.
- Dev server restart: If you change `.env*` files or shell variables, you must restart `react-scripts start` for changes to take effect.
- `NODE_ENV` handling: Managed by `react-scripts`. Do not set `NODE_ENV` manually in `.env`; rely on the script being run (`start` vs `build`).