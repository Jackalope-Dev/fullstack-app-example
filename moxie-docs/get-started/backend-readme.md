# API behavior documentation

## Overview
This area focuses on clarifying how the backend and frontend enforce contracts around API behavior, how to extend those behaviors, and what to watch for when modifying routes or data flows. It uses repository- and project-specific guidance to ensure changes remain aligned with existing patterns and expectations.

## Architecture
- backend/README.md: placeholder file in this repo path (empty content in source).
- AGENTS.md: provides guidance for documentation updates and agent workflow. It contains explicit expectations for when and how to update docs, and how to ensure consistency across edits. It also includes the directive to load conventions and patterns from the Moxie Docs MCP server before edits.

High-level flow as implied by files:
- Developer edits or extends API-related code and must update documentation accordingly using the guidance in AGENTS.md.
- Documentation updates should reflect changes to behavior, APIs, workflows, architecture, operational procedures, or setup paths.

Entry points and contracts are inferred from the presence of these files:
- There is no explicit HTTP route or API contract described in the provided source files. The guidance sets the standard for future documentation work when actual API routes are introduced.

## Files and what they document
### backend/README.md
- Path: backend/README.md
- Contents: null (empty)
- Responsibility: In this repo slice, this file would normally host backend-area guidance or API contract notes, but currently has no content to describe behavior, routes, or data contracts.
- Notable behaviors: None documented in this file; no inputs, outputs, or error cases described here.

### AGENTS.md
- Path: AGENTS.md
- Contents: A guidance block for documentation authors and agents. It explains how to use the Moxie Docs MCP server, what to update, and how to keep docs aligned with changes.
- Responsibility: Serves as an instruction set for maintainers on documentation discipline, especially around behavior/API changes and ensuring docs reflect updated workflows.
- Notable behaviors: Provides the rules for edits, the preference for small, source-cited updates, and cross-cutting consistency checks.

## Gotchas
- No concrete API routes or behaviors are defined in the provided files, so there are no per-route contracts, auth rules, or response schemas to document yet.
- The only explicit guidance is procedural: before editing, load conventions and patterns from the Moxie Docs MCP server; update docs when behavior or APIs change; ensure consistency across the file with other sections.
- If you introduce new API routes or backend logic, you should add explicit per-route sections detailing HTTP methods, paths, inputs, outputs, and error cases, and then update AGENTS.md with any new workflow implications.