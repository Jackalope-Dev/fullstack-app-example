# Frontend Testing (Create React App + React Testing Library)

This area documents the frontend test setup and conventions for the CRA-based app. It explains how tests are discovered and executed, the libraries in use, and how to extend the single existing test into a maintainable test suite.

## Architecture

- Test runner and harness: provided by `react-scripts test` (Jest under the hood) configured via CRA.
- Assertion and DOM matchers: `@testing-library/jest-dom` augments Jest’s `expect` with DOM-specific matchers.
- Rendering and queries: `@testing-library/react` drives component rendering and queries into the virtual DOM.
- User interaction helpers: `@testing-library/user-event` for realistic event simulation.
- Test discovery: CRA/Jest automatically picks up files named `*.test.js`, `*.test.jsx`, `*.spec.js`, or `*.spec.jsx` anywhere under `frontend/src/`.
- Control entry points:
  - CLI: `npm test` or `yarn test` executes `react-scripts test` with watch mode by default in interactive TTY.
  - Tests import components from `src/` and render with Testing Library to assert DOM output and behavior.

## frontend/package.json

Responsibility
- Declares testing dependencies and the script used to run tests.

Key contents
- Scripts:
  - `test`: `react-scripts test` (Jest runner with CRA defaults)
  - `start`, `build`, `eject` are unrelated to tests but share CRA tooling.
- Dependencies used by tests:
  - `@testing-library/jest-dom`: `^5.17.0`
  - `@testing-library/react`: `^13.4.0`
  - `@testing-library/user-event`: `^13.5.0`
- ESLint config extends `react-app/jest`, enabling Jest globals and Testing Library lint rules where applicable.

How it fits together
- Running `npm test` uses the CRA preset to set up Jest, load `@testing-library/jest-dom` automatically (via CRA’s default Jest setup), and execute any matching test files under `src/`.

Operational notes
- Watch mode: In interactive terminals, `react-scripts test` runs in watch mode; press `a` to run all tests, `p` to filter by filename, `t` to filter by test name.
- CI mode: When `CI=true` is set in the environment, CRA disables watch mode and treats warnings as failures during build (not test). For tests, it runs once and exits.

## frontend/src/App.test.js

Responsibility
- Provides a smoke test that verifies the `App` component renders a link with text matching `/learn react/i`.

Behavior
- Renders `<App />` using `render` from `@testing-library/react`.
- Uses `screen.getByText(/learn react/i)` to query for the element.
- Asserts `expect(linkElement).toBeInTheDocument()` using `@testing-library/jest-dom`.

Contracts and assumptions
- Imports `App` from `./App` and assumes `App` renders text matching “learn react” case-insensitively.
- Fails if the visible text changes or is removed, which can make the test brittle if the UI copy evolves.

Example structure to extend
- To add more tests, create files like `src/components/Button/Button.test.jsx` or colocate next to components, e.g., `src/components/Button.test.jsx`. CRA will discover both.

## Running, Extending, and Organizing Tests

Running tests
- Interactive: from `frontend/`, run `npm test` to start Jest in watch mode.
- Single run: `CI=true npm test` runs once and exits (useful for CI scripts).
- Filter by filename: after starting watch mode, press `p` and type part of the test file path.
- Filter by test name: press `t` and type part of the `test(...)` or `it(...)` name.

Adding tests
- File naming: use `*.test.js(x)` or `*.spec.js(x)` under `src/`.
- Typical test pattern:
  - Render the component with `render(...)`.
  - Query using `screen.getByRole`, `screen.getByText`, etc. Prefer role-based queries for resilience.
  - Interact with `userEvent` for realistic user flows.
  - Assert using `@testing-library/jest-dom` matchers like `toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`, etc.

Organizing tests
- Co-locate tests with components: keep `Component.jsx` next to `Component.test.jsx` to encourage maintenance with code changes.
- Use a shared test utils file (e.g., `src/test-utils.jsx`) if you need common render wrappers (providers, routers). Import it in tests as needed. Note: this repository does not currently include such a file—add it under `src/` if required.

Common patterns
- Async UI: use `findBy...` queries or `waitFor` when asserting results after async effects.
- Accessibility-first queries: use `getByRole({ name: /label/i })` rather than brittle `getByText` when possible.
- User flows: prefer `userEvent` over `fireEvent` to simulate typing, clicks, and tab navigation.

## Gotchas

- Text-coupled assertions: The current `App.test.js` asserts on the literal text `/learn react/i`. UI copy changes will break this test. Prefer role and accessible name queries (e.g., `getByRole('link', { name: /learn react/i })`) or data-driven selectors where appropriate.
- Test discovery location: Jest via CRA only discovers tests under `src/`. Placing tests outside `frontend/src/` will not run.
- ESM/CommonJS interop: CRA config handles most cases; avoid custom Jest config unless ejecting. If you eject, you must maintain Jest config yourself.
- Environment differences: In CI (`CI=true`), watch mode is disabled and some timing may differ. Write tests that do not rely on watch-specific behavior.
- DOM matchers availability: `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument`) are available because CRA’s Jest setup imports it. If tests run outside CRA defaults (after eject), ensure `setupTests.js` imports `@testing-library/jest-dom` explicitly.