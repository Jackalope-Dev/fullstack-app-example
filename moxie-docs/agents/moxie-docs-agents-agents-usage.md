# Agents usage documentation area

This area is intended to document how “agents” are expected to be used across the codebase. It should connect the conceptual guidance for agents to the concrete code entry points and workflows that maintainers follow when editing backend or frontend code.

## Architecture

- Location: `moxie-docs/agents/agents-usage.md`
- Purpose: Provide a single, authoritative map from agent concepts to implementation touchpoints (APIs, background workers, UI surfaces) and the expected contracts between them.
- Control flow: This doc should describe where control enters agent code (e.g., API routes, job runners, event handlers), how data moves between layers (payload shapes, queues, persistence), and what side effects occur (external API calls, database writes, cache updates).
- Consumers: Backend and frontend maintainers who need to trace or modify behavior involving agents without reverse‑engineering the repository.

## moxie-docs/agents/agents-usage.md

Responsibility:
- This is the top-level usage guide for agents. It should explicitly enumerate the concrete code touchpoints where agent behavior is invoked and define the contracts for each touchpoint (inputs, outputs, errors, auth). It should also outline the development workflow for safely changing agent-related code across backend and frontend boundaries.

Behavior expectations to capture in this file:
- Entry points: List the actual routes, functions, or modules that initiate agent work. For each, include the full path, the triggering conditions, and the execution context (request/response cycle, background job, websocket, etc.).
- Data flow: Describe payload schemas passed into agents, persistent storage interactions, and any events or messages emitted for downstream consumers.
- Side effects: Document external API calls, long‑running tasks, and failure handling semantics (retries, idempotency keys, compensating actions).
- Frontend integration: Identify UI components that display or manipulate agent state, the APIs they call, and the loading/error states they expect.
- Auth and permissions: Clarify how callers are authenticated and authorized at each entry point, including required headers/tokens and error codes for unauthorized/forbidden cases.
- Observability: Note where logging, metrics, and tracing are emitted so changes can be verified and debugged.

What’s not obvious from the name:
- The file is not just high‑level philosophy; it should anchor directly to code. Each referenced touchpoint must include the exact source path and, for APIs, the HTTP method, route, inputs/outputs, and status codes. For background jobs or modules, include the function names and invocation paths.

Recommended structure inside this file:
- Overview of agents and responsibilities
- Concrete entry points (backend APIs, workers, schedulers) with links to source
- Frontend surfaces and workflows with links to components/pages
- Contracts and payload schemas
- Error handling and retries
- Security and permissions
- Common development tasks and testing guidance

## Gotchas

- Drift risk: If this file lists conceptual guidance without linking to real code paths, it becomes stale and unhelpful. Every agent workflow described here should point to exact source files and identifiers.
- Contract changes: Altering payload shapes or status codes in agent APIs must be reflected here to avoid breaking frontend consumers or downstream jobs.
- Auth assumptions: Be explicit about required authentication and authorization. Missing or ambiguous auth notes are a common source of production issues.
- Side effects and ordering: If agents perform multi‑step operations, document ordering guarantees and idempotency; otherwise, retries may cause duplicates or partial updates.