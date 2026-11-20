# Frontend Testing (CRA + React Testing Library)

This area documents how tests are discovered and executed for the Create React App–based frontend, and the concrete behavior of the existing test. It exists to help you quickly add reliable tests and understand the minimal setup already in place.

## Architecture

- Entry point: `npm test` in `frontend/` runs `react-scripts test` (Jest) with CRA defaults.
- Discovery: Jest (via CRA) auto-discovers `*.test.js|jsx|ts|tsx` and `*.spec.js|jsx|ts|tsx` under `frontend/src/` only.
- Rendering and queries: `@testing-library/react` provides `render` and screen queries against a virtual DOM.
- Assertions: `@testing-library/jest-dom` extends Jest `expect(...)` with DOM matchers like `toBeInTheDocument`.
- Interaction: `@testing-library/user-event` is available to simulate real user actions (typing, clicks) when you add tests.

Component test flow
- A test imports a component from `frontend/src/...`.
- The component is rendered with `render(...)`.
- The test queries the DOM via `screen.getBy.../findBy.../queryBy...`.
- Assertions are performed with Jest plus jest-dom matchers.

## frontend/src/App.test.js

Responsibility
- A smoke test that ensures the `App` component renders a link whose text includes “learn react”. This validates the basic render pipeline and jest-dom integration.

Behavior and important details
- Imports: `render`, `screen` from `@testing-library/react`, and `App` from `./App`.
- Test name: `renders learn react link`.
- Renders `<App />` and executes: `const linkElement = screen.getByText(/learn react/i);`.
- Assertion: `expect(linkElement).toBeInTheDocument();` (matcher supplied by `@testing-library/jest-dom`).

Contracts and coupling
- The test couples to the `App` UI copy by searching for `/learn react/i`. Any change to that visible text will fail the test.
- No routing/providers are set up in the test; if `App` starts to require providers (e.g., Router, Context), you will need to wrap render calls via a shared test util.

Inputs and side effects
- Inputs: none (the test renders with default props).
- Side effects: none beyond virtual DOM creation.
- Errors: If `App` fails to render or the text isn’t present, `screen.getByText` throws and the test fails.

## frontend/README.md

Responsibility
- Documents standard CRA commands relevant to development and testing.

Key testing instructions present
- `npm test`: Launches the CRA/Jest test runner in interactive watch mode.
- Links to CRA documentation for running tests and troubleshooting.

How it fits together
- Using `npm test` is the supported way to execute the test suite described above; no custom Jest configuration is present in this repository.

## moxie-docs/testing/frontend-src-app-test.md

Responsibility
- This in-repo documentation elaborates the frontend testing setup, libraries in use, discovery rules, how to run tests interactively and in CI, and conventions to extend beyond the single existing test.

Key contents
- Explains CRA-based test runner (`react-scripts test`), jest-dom availability, Testing Library usage, and discovery patterns.
- Suggests co-location of tests with components and the creation of a shared `src/test-utils.jsx` wrapper when providers are needed.
- Notes behavior differences in CI (`CI=true`) versus local watch mode and common Testing Library practices (role-based queries, async handling with `findBy`/`waitFor`).

Operational notes surfaced here
- Press `a` to run all, `p` to filter by filename, `t` to filter by test name in Jest watch mode.
- Emphasizes resilient selectors (e.g., `getByRole`) to avoid brittle text coupling like in `App.test.js`.

## Gotchas

- Test discovery scope: Only files under `frontend/src/` are discovered. Tests outside this tree will not run.
- Brittle text assertions: `App.test.js` uses `screen.getByText(/learn react/i)`. Prefer semantic queries like `getByRole('link', { name: /learn react/i })` to reduce coupling to incidental text structure.
- Implicit jest-dom setup: The matcher `toBeInTheDocument` works because CRA config includes jest-dom setup. If you later eject or customize Jest, ensure `setupTests.js` imports `@testing-library/jest-dom`.
- Provider requirements: As `App` grows to depend on Router/Context, wrap renders with the necessary providers. Centralize that in a `src/test-utils.jsx` to avoid repetitive setup.
- CI mode: With `CI=true`, Jest runs once and exits; do not rely on watch-specific interactions or prompts in automated environments.