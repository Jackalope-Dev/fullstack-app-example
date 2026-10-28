# API Behavior and Contract Documentation

This page documents the frontend-backend API interaction for the project information feature used by the frontend app. It explains what the API route does, its inputs/outputs, error handling, and how the UI consumes it. It helps engineers understand the data shape, endpoint behavior, and potential gotchas when evolving the API contract.

## Architecture

- The frontend entry point that consumes the API is `frontend/src/App.js`.
- It fetches data from the backend API endpoint composed as `${config.backendUrl}/api/project`.
- The data returned by the API is stored in React state `projectData` via `setProjectData` and then rendered in the component.
- The flow is:
  - Component mounts → useEffect triggers a fetch → response is parsed as JSON → data is stored → UI renders project details.
- There is a single, simple data contract: a JSON object containing project metadata used to render a small dashboard of the project.
- No special middleware or route layout is described in the source snippet; the component relies on the backend exposing `/api/project` under the configured backend URL.

## Significant source files and routes

### `frontend/src/App.js`
- Type: Frontend page/component
- Responsibility: Renders a small “Project Information” UI and drives data fetching from the backend API.
- What it renders/does:
  - On mount, it fetches data from `${config.backendUrl}/api/project`.
  - It stores the response JSON into state variable `projectData` via `setProjectData`.
  - Rendering logic:
    - If `projectData` is present, it renders:
      - A heading with the project name: `projectData.projectName`.
      - A paragraph with the student name: `projectData.studentName` (labeled as “Student”).
      - A paragraph with the project description: `projectData.projectDescription` (labeled as “Description”).
      - A link to the project URL: `projectData.projectUrl` opening in a new tab with `rel="noopener noreferrer"`.
    - If `projectData` is not yet available, it shows a “Loading…” message.
- Data it relies on / expected shape:
  - The API must return a JSON object with at least the following fields:
    - `projectName` (string)
    - `studentName` (string)
    - `projectDescription` (string)
    - `projectUrl` (string, URL)
- Inputs: None directly from the user in this component; it performs a fetch for initial data on mount.
- Outputs: UI rendering based on the fetched data.
- Notable behaviors:
  - The fetch uses the global `config.backendUrl` to determine the API host.
  - The component does not implement retry logic, error handling, or loading states beyond a simple loading message.
- Auth/authorization: Not explicit in the code snippet. There is no explicit authentication header management shown in `frontend/src/App.js`.
- Error cases: The code does not handle HTTP errors or JSON parsing failures in the provided snippet. It assumes a successful JSON response.
- Full request path: `GET ${config.backendUrl}/api/project`.
- Response expectations: JSON object with fields `projectName`, `studentName`, `projectDescription`, `projectUrl`.

### `backend/README.md`
- Type: Repository overview/placeholder
- Responsibility: Not implemented in the provided source (empty content).
- Note: There is no backend route documentation or implementation included in the sources provided. The documentation here references the frontend expectation of a backend route at `/api/project`.

## Data flow and contracts in practice
- Entry point: The app loads and immediately runs the effect to fetch project data from the backend. This is driven by `useEffect(() => { fetch(...) }, [])`.
- Data shape (as consumed by UI): The frontend expects a single JSON object with four string fields: `projectName`, `studentName`, `projectDescription`, `projectUrl`.
- Rendering decisions are entirely driven by the presence of `projectData`:
  - If data exists, render details; otherwise, show Loading.
- No explicit caching layer; data is stored in `projectData` state within `App.js` and will re-render on update.

## Gotchas
- Backend route availability: The frontend assumes a backend URL is configured in `config.backendUrl` and that a GET `/api/project` returns the expected JSON. If the endpoint changes (path, shape, or auth requirements), the UI will fail to render content or crash due to missing fields.
- Error handling gaps: The code does not handle non-200 responses, network errors, or invalid JSON; a failed fetch could leave the UI in a perpetual Loading state. Consider adding `.catch` and checking `response.ok` before `response.json()`.
- Authentication: There is no visible auth header or token handling in the snippet. If the backend requires auth, you must extend the fetch call to include credentials (e.g., Authorization header) or use an authenticated API client.
- Data freshness: The UI fetches data once on mount. If the backend data changes, the UI will not reflect updates until a reload unless you add a refresh mechanism.
- Data validation: The UI accesses specific fields without guards. If the backend returns a differently shaped payload or missing fields, the UI could render undefined values or crash. Consider validating the payload and handling missing fields gracefully.