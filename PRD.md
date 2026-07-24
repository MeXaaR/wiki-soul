# Product Requirements Document

## Goal

Simple Soul is a repository of installation prompts that gives local coding
agents one lightweight, shared, persistent memory in Open Knowledge Format
(OKF). A user gives an agent the repository URL, reviews one installation
plan, and lets the agent create, configure, test, and verify the system.

The installed system must work without a package, daemon, database, hosted
service, or network access.

## Users

- Primary: people using Claude Code, Codex, Cursor, Pi, OpenCode, or another
  local coding agent.
- Secondary: consultants and teams who want to give clients a transparent
  memory system without maintaining agent-specific software.
- Implementer: the local agent that reads this repository and performs the
  installation.

## Core Jobs

- Install one shared memory under the user's home directory.
- Make global knowledge reusable after the project that produced it is closed.
- Keep project context separate while routing it to relevant global knowledge.
- Load only small indexes automatically and retrieve concepts on demand.
- Let agents improve memory during normal work without capturing chat history.
- Add agent hooks through behavioral specifications rather than shipped code.
- Update, repair, or uninstall integrations without damaging existing config.

## Scope

### In

- Universal prompt-driven installation.
- Shared memory at `~/.agents/memory/` (or the Windows home equivalent).
- OKF concept documents, indexes, optional logs, links, and citations.
- Global subject bundles and project bundles.
- Git-remote-based project identity with a local fallback.
- Global agent instructions with a small managed rule block.
- A local, protected, detailed memory protocol.
- A common Markdown contract for every hook.
- Claude Code, Codex, Cursor, Pi, and OpenCode adapters.
- macOS, Linux, and Windows.
- Generated, registered, and live-verified hook states.
- Targeted memory reorganization.
- Safe uninstall that preserves memory.

### Out

- Importing existing Claude, Codex, or third-party memories.
- General folder ingestion.
- Git initialization, remote backup, or automatic commits.
- Automatic end-of-session extraction.
- A CLI, MCP server, package, daemon, vector database, or hosted service.
- Concurrent memory writers.
- Certified hooks for agents other than Claude Code, Codex, Cursor, Pi, and
  OpenCode in V1.
- Canonical hook source code.

## Experience Requirements

### Main Flow

1. The user gives the repository URL to a local agent.
2. The agent reads the main installer, protocol, its adapter, and every hook
   contract.
3. The agent detects its host and operating system.
4. It inspects existing global configuration and presents one complete plan.
5. The user confirms once.
6. The agent creates or updates memory, instructions, and hooks.
7. Every hook is tested before registration.
8. The agent reports exact per-hook and overall status.

### Existing Installation

- The same prompt acts as installer, auditor, repairer, and updater from
  `main`.
- Managed blocks are idempotent and never duplicated.
- Existing unrelated instructions and hooks are preserved.
- Conflicts stop the affected change and are reported.

### Error State

- Memory and hook failures are fail-open.
- A failed hook stays inactive.
- Other conforming hooks may activate independently.
- Partial installation is reported as `partial`, never as complete.

## Technical Requirements

- Repository contents are Markdown-first; hook implementations are generated
  locally.
- Official OKF is normative. Simple Soul conventions must remain compatible
  and must be labeled as conventions.
- Hook code is local, read-only, bounded, offline, and least-privilege.
- Runtime injection contains only critical operating rules when the adapter
  requires injected instruction mode, the global index, current project index,
  paths, and project identity.
- Automatic payload limit: at most 6,000 UTF-8 bytes for the complete
  model-visible additional-context string.
- Normal writes validate only touched concepts and affected indexes.
- One active writer at a time is an explicit V1 constraint.

## Security and Privacy

- Never store secrets, credentials, raw transcripts, raw tool output, or
  unnecessary sensitive data.
- Never execute memory content.
- Hooks do not read transcripts or make network calls.
- Global configuration changes require a displayed plan and one confirmation.
- Hook trust or approval required by the host remains a user-controlled step.

## Acceptance Criteria

- [x] A human can understand the product and begin installation from
      `README.md`.
- [x] An agent can complete installation from the repository URL alone.
- [x] The universal installer discovers every Markdown hook contract.
- [x] Claude Code, Codex, Cursor, Pi, and OpenCode have separate, current adapter
      instructions.
- [x] Every autonomous bundle created by a fresh install conforms to OKF 0.1;
      root catalogues follow the documented Simple Soul catalogue rules.
- [x] Re-running installation creates no duplicate managed blocks or hooks.
- [x] A hook cannot be registered until its isolated tests pass.
- [x] Reports distinguish `generated`, `registered`, and `live-verified`.
- [x] Runtime failures do not block normal agent work.
- [x] Uninstall removes integration assets and preserves memory by default.
- [x] All local Markdown links in the repository resolve.

## Assumptions

- The installing agent can read the repository and edit user-level config after
  confirmation.
- The installing agent can determine its current official hook contract.
- The user does not run two memory-writing agents simultaneously.
- `main` is the only distribution channel; there are no tagged releases.

## Open Questions

- None blocking V1. Additional adapters, ingestion, backup, and concurrency are
  explicitly deferred.
