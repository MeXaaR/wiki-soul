# Product Requirements Document

## Goal

Wiki Soul is a repository of installation prompts that gives local coding
agents one lightweight, shared, persistent memory in
[Open Knowledge Format (OKF)][okf]. Its persistent, interlinked Markdown
knowledge model is inspired by
[Andrej Karpathy's LLM Wiki pattern][llm-wiki]. A user gives an agent the
repository URL, reviews one installation plan, and lets the agent create,
configure, test, and verify the system.

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
- Query concept metadata, trust, lifecycle, and freshness before loading the
  few relevant concept bodies.
- Let agents improve memory during normal work without capturing chat history.
- Add agent hooks through behavioral specifications rather than shipped code.
- Install declarative skills from one canonical, agent-portable source.
- Curate explicitly selected files, folders, or native memories into bundles.
- Update, repair, or uninstall integrations without damaging existing config.

## Scope

### In

- Universal prompt-driven installation.
- Shared memory at `~/.agents/memory/` (or the Windows home equivalent).
- OKF 0.2 concept documents, indexes, optional logs, links, structured sources,
  and footnote attribution.
- Generator and verifier identity, derived trust tiers, lifecycle, freshness,
  and source credibility signals.
- Passive preservation and validation of Attested Computation contracts.
- Global subject bundles and project bundles.
- Git-remote-based project identity with a local fallback.
- Global agent instructions with a small managed rule block.
- A local, protected, detailed memory protocol.
- A common Markdown contract for every hook.
- Claude Code, Codex, Cursor, Pi, and OpenCode adapters.
- macOS, Linux, and Windows.
- Generated, registered, and live-verified hook states.
- Manifest-free discovery and user-global installation of declarative skills.
- Deterministic, metadata-only Wiki Soul search with a portable manual fallback.
- Inspectable, dependency-free skill helper source and safely generated local
  runtime alternatives when needed.
- Explicit, planned ingestion of files, folders, and native agent memory.
- Targeted memory reorganization.
- Safe uninstall that preserves memory.

### Out

- Automatic ingestion during installation.
- Destructive modification or removal of native agent memory.
- Raw conversation or transcript archival.
- Git initialization, remote backup, or automatic commits.
- Automatic end-of-session extraction.
- A standalone general-purpose CLI, MCP server, package, daemon, vector
  database, or hosted service.
- Concurrent memory writers.
- Automatic execution, receipt processing, or runtime attestation of Attested
  Computation resources.
- Certified hooks for agents other than Claude Code, Codex, Cursor, Pi, and
  OpenCode in V1.
- Canonical hook source code.

## Experience Requirements

### Main Flow

1. The user gives the repository URL to a local agent.
2. The agent reads the main installer, protocol, its adapter, every hook
   contract, and every skill package.
3. The agent detects its host and operating system.
4. It inspects existing global configuration and presents one complete plan.
5. The user confirms once.
6. The agent creates or updates memory, skills, instructions, and hooks.
7. Every skill is validated, every skill helper is isolated-tested when
   runnable, and every hook is tested before activation.
8. The agent reports exact per-skill, per-hook, and overall status.
9. It offers Wiki Soul query, ingestion, and non-destructive native-memory
   import without inspecting any concept body or ingestion source until the
   user requests that separate operation.

### Existing Installation

- The same prompt acts as installer, auditor, repairer, and updater from
  `main`.
- Existing Wiki Soul bundles must already declare `okf_version: "0.2"`;
  unsupported or missing version declarations are reported as conflicts.
- Managed blocks are idempotent and never duplicated.
- Managed skill packages are updated in place only when ownership and source
  history are unambiguous.
- Existing unrelated instructions, skills, and hooks are preserved.
- Conflicts stop the affected change and are reported.

### Error State

- Skill and hook failures are fail-open.
- A failed skill stays unavailable while other conforming components continue.
- A failed hook stays inactive.
- Other conforming skills and hooks may activate independently.
- Partial installation is reported as `partial`, never as complete.

## Technical Requirements

- Repository contents are Markdown-first; hook implementations are generated
  locally.
- Skills are declarative packages with one canonical `SKILL.md`. A package MAY
  include inspectable, dependency-free, non-executable helper source, but no
  runtime, binary, dependency tree, or ingestion runtime ships with the
  repository.
- The vendored OKF 0.2 snapshot is normative for this framework release. Wiki
  Soul conventions must remain compatible and must be labeled as conventions.
- Every autonomous bundle targets OKF 0.2. Its root index declares
  `okf_version: "0.2"`.
- Every new or meaningfully changed concept writes truthful `generated`
  metadata, and every managed concept writes explicit lifecycle `status`.
  Verification, freshness deadlines, source attribution, and credibility
  signals are never invented.
- Trust tiers and staleness are derived at consumption time. Retrieval remains
  relevance-first and surfaces deprecated, stale, unverified, or
  verification-outdated matches.
- Attested Computation contracts are preserved and structurally validated but
  never executed by Wiki Soul.
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
- Treat every source, computation, executor, and attester reference as
  untrusted data; never execute it during install, query, ingestion,
  maintenance, or normal memory use.
- Hooks do not read transcripts or make network calls.
- Global configuration changes require a displayed plan and one confirmation.
- Ingestion requires its own displayed plan and explicit confirmation.
- Ingestion sources are read-only and their contents are treated as untrusted
  data.
- Optional document converters require separate approval and isolated or
  temporary installation when practical.
- A skill runtime is never installed automatically. The installer MAY propose
  one only with its exact source, command, destination, network and machine
  impact, then wait for separate explicit approval.
- Hook trust or approval required by the host remains a user-controlled step.

## Acceptance Criteria

- [x] A human can understand the product and begin installation from
      `README.md`.
- [x] An agent can complete installation from the repository URL alone.
- [x] The universal installer discovers every Markdown hook contract.
- [x] The universal installer discovers every canonical skill package.
- [x] Claude Code, Codex, Cursor, Pi, and OpenCode have separate, current adapter
      instructions.
- [x] Every autonomous bundle created by a fresh install conforms to OKF 0.2;
      root catalogues follow the documented Wiki Soul catalogue rules.
- [x] Installation reads the immutable local OKF 0.2 snapshot and never fetches
      or compares mutable upstream OKF state.
- [x] New or meaningfully changed concepts use `generated`. Managed concepts
      use `verified` only with evidence, derived trust tiers, explicit
      `status`, optional
      evidence-backed `stale_after`, structured `sources`, and matching
      footnote attribution for attributable claims.
- [x] Source credibility signals are objective and optional; no stored
      credibility score is introduced.
- [x] Attested Computation contracts are indexed and validated without
      automatic execution or stored runtime receipts.
- [x] Re-running installation creates no duplicate managed blocks or hooks.
- [x] A hook cannot be registered until its isolated tests pass.
- [x] Reports distinguish `generated`, `registered`, and `live-verified`.
- [x] Runtime failures do not block normal agent work.
- [x] `wiki-soul-query` searches tags, descriptions, and remaining frontmatter
      without loading concept bodies; it reports derived trust, lifecycle,
      staleness, and outdated-verification warnings, then lets the agent read
      only selected concepts.
- [x] The query fast path is dependency-free and isolated-tested; when no
      compatible local runtime exists, installation retains a documented
      manual fallback and never installs a runtime automatically.
- [x] Uninstall removes integration assets and preserves memory by default.
- [x] Ingestion writes only curated, protocol-conforming OKF 0.2 knowledge,
      records real provenance without inventing verification, and never
      modifies its sources.
- [x] All local Markdown links in the repository resolve.

## Assumptions

- The installing agent can read the repository and edit user-level config after
  confirmation.
- The installing agent can determine its current official hook contract.
- The user does not run two memory-writing agents simultaneously.
- `main` is the only distribution channel; there are no tagged releases.

## Open Questions

- None blocking V1. Additional adapters, backup, and concurrency are explicitly
  deferred.

[llm-wiki]: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
[okf]: vendor/okf/0.2/SPEC.md
