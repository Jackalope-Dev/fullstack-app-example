# Testing strategy guidance for the repository

Overview: This area documents how testing is organized across frontend and backend, and what you need to know to run, reason about, and extend tests. The repository currently contains a basic frontend test and a minimal backend package.json; this page clarifies where tests live, how to run them, and what the expected testing approach should be in this project.

## Architecture
- Frontend tests: located at frontend/src/App.test.js. This is a React Testing Library test that renders the App component and asserts the presence of a "learn react" link. It demonstrates a standard component/test structure for the frontend, but there is no dedicated test runner configuration documented here.
- Backend tests: backend/package.json includes a test script placeholder that currently prints an error about no tests specified. This signals there is no configured backend test runner in this repository yet.
- Documentation agent guidance: AGENTS.md provides high-level guidance for updating docs and conventional practices when making changes, which influences how tests should be added or updated alongside code.

## Entry points for testing
- Frontend: Run the frontend test suite using the project’s usual React tooling (not explicitly defined in the files shown). The frontend test file is at frontend/src/App.test.js and uses React Testing Library with a typical render-and-assert pattern.
- Backend: There is no test command wired up in backend/package.json. To add tests, you would introduce a test runner (e.g., Jest, Mocha) and a script (e.g., "test": "jest"), plus test files under an appropriate backend test directory.

## Contracts, auth, and side effects that matter
- Frontend tests rely on standard DOM rendering behavior and the presence of text content. They do not model API calls or authentication in the shown test, so any integration tests that depend on API endpoints or auth would require additional setup not present here.
- Backend currently has no tests and no authentication logic defined in the package.json. If you add tests that exercise routes, consider how CORS, body parsing, and Express middleware would be configured (dependencies show cors and express).

## What would bite you if you changed this area
- If you introduce backend tests without configuring a test runner, your tests will not run. You must add a test framework and update package.json scripts accordingly.
- If you modify frontend tests, ensure the App component and the environment still render as expected; changing UI text or structure will break tests that rely on exact content like the "learn react" string.
- When adding cross-cutting tests (integration tests involving API calls), you need to decide how to mock or spin up backend services and ensure test isolation.

## Gotchas
- The AGENTS.md guidance indicates you should update human-readable docs when changes affect behavior or setup. If you add tests, consider documenting how to run them, any required local services, and any environment variables.
- The backend currently lists no test script; adding tests requires adding dependencies (e.g., a test runner) and adjusting the repository’s docs to reflect how backend tests are executed.
- There is no explicit test configuration in the shown files; plan to introduce configuration files (e.g., Jest config, ESLint for tests) only as part of the test tooling setup to avoid diverging conventions.

## Quick actions to strengthen this area
- Add a backend test framework and a basic test file under a new tests/ directory, plus a script in backend/package.json such as "test": "jest".
- Consider expanding frontend tests to cover more components and routes, and document how to run tests in a project-wide script (e.g., a root npm or yarn script).
- Update AGENTS.md with a minimal, actionable testing section: how to run frontend tests, how to setup backend tests, and any environment prerequisites.