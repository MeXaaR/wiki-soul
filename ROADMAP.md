# Roadmap

## Current Objective

Ship a complete V1 prompt library that installs and operates lightweight,
shared OKF memory and declarative skills through Claude Code, Codex, Cursor,
Pi, OpenCode, and a generic fallback.

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Done
- [!] Blocked

## Slices

### Slice 1: Product contract

Status: [x]

Value: Turn the completed design interview into one normative product contract.

Acceptance criteria:

- [x] PRD records goal, scope, security, and acceptance criteria.
- [x] `SPEC.md` records filesystem, memory lifecycle, routing, and installer
      behavior.
- [x] OKF compatibility boundary is explicit.

Verification:

- Cross-checked against the agreed design and vendored OKF 0.2 specification.

### Slice 2: Universal installation

Status: [x]

Value: Let a user install from one repository URL.

Acceptance criteria:

- [x] Main installer covers fresh install, audit, repair, and update.
- [x] Generic fallback installs the memory core without a certified hook.
- [x] Uninstaller removes managed integration and preserves memory.

Verification:

- Walked fresh, existing, conflicting, update, uninstall, and unsupported-agent
  paths against the normative contracts.

### Slice 3: Memory protocol

Status: [x]

Value: Give every agent the same lightweight read/write behavior.

Acceptance criteria:

- [x] Protocol covers routing, project identity, write thresholds, validation,
      safety, maintenance, and single-writer constraint.
- [x] Installed critical block stays short.
- [x] Example memory structure is OKF-compatible.

Verification:

- Protocol YAML parsed; OKF conformance and inter-bundle rules received a
  dedicated read-only audit.

### Slice 4: Hook library and adapters

Status: [x]

Value: Inject memory reliably without shipping canonical hook code.

Acceptance criteria:

- [x] Hook discovery is directory-based and manifest-free.
- [x] Injection contract defines behavior, security, tests, and lifecycle.
- [x] Claude Code adapter uses current official integration surfaces.
- [x] Codex adapter uses current official integration surfaces.
- [x] Hook statuses and partial failure behavior are defined.

Verification:

- Both adapters received dedicated read-only reviews against current official
  host documentation; blocking findings were corrected.

### Slice 5: Documentation and final audit

Status: [x]

Value: Make the repository understandable to both humans and agents.

Acceptance criteria:

- [x] README explains concept, benefits, architecture, installation, and limits.
- [x] Hook-extension guide makes adding one Markdown contract sufficient.
- [x] Repository links and referenced paths resolve.
- [x] Final security and consistency audit passes.

Verification:

- Verified all Markdown files, local links and anchors, required hook sections,
  YAML frontmatter, fixed identity vectors, and core security invariants. No
  runtime or canonical hook code ships in the repository.

### Slice 6: Cursor adapter

Status: [x]

Value: Let Cursor install and operate the same shared memory autonomously.

Acceptance criteria:

- [x] The universal installer selects a dedicated Cursor adapter.
- [x] The adapter uses Cursor's user `hooks.json` and native `sessionStart` and
      `subagentStart` lifecycle events.
- [x] Generated hook code remains under `~/.agents/hooks/cursor/`.
- [x] Cursor User Rules, private databases, account APIs, and client-project
      files remain untouched.
- [x] When no safe local global-rules file exists, critical instructions are
      injected once per logical context within the existing 6,000-byte limit.
- [x] Registration, live verification, fail-open behavior, idempotent update,
      and uninstall are specified.

Verification:

- Cross-checked against the locally installed Cursor 3.3.30 schema and
  configuration paths. The adapter still requires current official
  documentation and installed-schema verification during every installation.

### Slice 7: Pi adapter

Status: [x]

Value: Let Pi bootstrap, test, register, and reload its own Wiki Soul
integration without requiring a preinstalled hook framework.

Acceptance criteria:

- [x] The universal installer selects a dedicated Pi adapter.
- [x] The adapter treats native TypeScript extensions as Pi's hook mechanism.
- [x] Bootstrap uses built-in Pi tools and explicit `-e` candidate loading.
- [x] Generated code remains in immutable revisions under
      `~/.agents/hooks/pi/`.
- [x] Registration uses the exact extension path in user-global Pi settings.
- [x] `/reload`, compaction, resume, tree navigation, and enabled subagent
      behavior have explicit verification requirements.
- [x] Third-party `hooks.json` files, Pi source, packages, sessions, existing
      memories, and client-project files remain untouched.

Verification:

- Cross-checked against current official Pi documentation and the locally
  installed Pi 0.80.10 package, including extension, settings, session,
  project-trust, reload, and security contracts. The adapter still requires
  installation-time verification because Pi's API evolves quickly.

### Slice 8: OpenCode adapter

Status: [x]

Value: Let OpenCode load the same shared memory through native global rules
and a dependency-free local plugin.

Acceptance criteria:

- [x] The universal installer selects a dedicated OpenCode adapter.
- [x] Critical rules use a native global file without shadowing an existing
      Claude fallback rules file.
- [x] Generated plugin code remains in immutable revisions under
      `~/.agents/hooks/opencode/`.
- [x] Registration uses the exact local production path in user-global
      OpenCode configuration.
- [x] System-prompt reconstruction adds one bounded envelope per model request
      without accumulating conversation messages.
- [x] New session, resume, compaction, child-session, `--pure`, failure,
      update, and uninstall behavior have explicit verification requirements.
- [x] Packages, auth, sessions, existing memories, and client-project files
      remain untouched.

Verification:

- Cross-checked against current official OpenCode rules, config, plugin, agent,
  and CLI documentation; OpenCode 1.18.4 source contracts; and the locally
  installed OpenCode 1.15.7 system-transform and local-path plugin seams. The
  adapter still requires installation-time and selected-surface verification
  because the required hook remains experimental.

### Slice 9: Declarative skills, query, and ingestion

Status: [x]

Value: Install portable agent skills, query Wiki Soul without loading the
corpus, and curate existing content on explicit request.

Acceptance criteria:

- [x] Skill discovery is directory-based and manifest-free.
- [x] One canonical package is installed under `~/.agents/skills/`.
- [x] Native skill exposure is used only through a documented user-global
      surface; other agents receive a manual fallback.
- [x] `wiki-soul-query` searches global and current-project frontmatter by
      default, ranks deterministic metadata matches, and never searches or
      returns concept bodies.
- [x] Query results derive trust tier, lifecycle, staleness, and
      outdated-verification warnings while keeping relevance primary and
      matching concepts visible.
- [x] The canonical query helper is dependency-free source. The installer
      tests an existing compatible runtime, may generate a marked equivalent,
      and never installs a runtime without separate explicit approval.
- [x] Generated skill runtimes are auditable, replaceable, and removable only
      through exact ownership markers.
- [x] `wiki-soul-ingest` handles selected files, folders, native memories, and
      explicitly selected conversation sources.
- [x] Every ingestion inventories and plans before writing.
- [x] Large ingestions support progressive batches and analysis-only
      subagents while preserving one memory writer.
- [x] Sources remain read-only; secrets, raw transcripts, and raw tool output
      never enter memory.
- [x] Skill audit, repair, update, uninstall, partial failure, and final
      installation offer are specified.

Verification:

- Canonical skill metadata, helper source, ownership markers, and query
  self-tests validated.
- Installer, uninstaller, product contract, specification, roadmap, and README
  cross-checked for metadata-only query and explicit-ingestion boundaries.

### Slice 10: Direct OKF 0.2 adoption

Status: [x]

Value: Make OKF 0.2 the native format for the complete Wiki Soul framework and
every bundle created by installation.

Acceptance criteria:

- [x] Every autonomous bundle root declares `okf_version: "0.2"`.
- [x] Managed writers emit truthful `generated: { by, at }` for every new or
      meaningfully changed concept and explicit `status`.
- [x] External provenance uses structured `sources`; per-claim attribution uses
      footnotes keyed by stable source IDs.
- [x] `verified` events use the actor convention and are written only after
      real checks. Trust tiers remain derived, not stored.
- [x] `stale_after` uses an evidence-backed absolute date. Staleness and
      verification-outdated state are derived and surfaced.
- [x] Objective source `author`, `usage_count`, `last_modified`, and
      `usage_window` signals are preserved and validated without a subjective
      credibility score.
- [x] Attested Computation contracts, including runtime, parameters,
      computation, executor, receipt shape, and deterministic attester
      references, are preserved and validated without execution.
- [x] Fresh installation creates the memory core, protocol, subject bundles,
      and project bundles directly as OKF 0.2.
- [x] Installation uses an immutable, checksummed local OKF 0.2 snapshot and
      never depends on mutable upstream OKF state.
- [x] Audit, repair, maintenance, and ingestion accept installed destinations
      declaring OKF 0.2 and report other version states as conflicts.
- [x] Installer, protocol, maintenance, query, ingestion, hooks, skills,
      uninstall, examples, and product documentation share the same 0.2
      contract.

Verification:

- Compared the complete repository contract against the vendored OKF 0.2
  sections on provenance, trust, lifecycle, actor identity, versioning,
  conformance, and Attested Computation.
- Validated local Markdown links, YAML examples, query fixtures, and
  passive-attestation security invariants.

## Discovered Follow-ups

- Add adapters for Gemini CLI and other agents.
- Add optional Git backup hook.
- Add a concurrency protocol only if real usage requires multiple writers.

## Risks / Blockers

- Agent hook contracts evolve independently; adapters must require local
  verification rather than assume a frozen schema.
- OpenCode's experimental system transform may also run for auxiliary model
  requests. Its provider boundary, non-persistence, and overhead must be
  reverified for every installed version.
- `main` is mutable. The installer must audit behavior on every rerun.
- Generated hook code is nondeterministic. Acceptance tests are the stable
  contract.
- Native skill surfaces vary by agent and version. Installation must inspect
  current documented capabilities and retain the manual fallback.
- Attested Computation execution protocols, receipt wire formats, attester ABI,
  and sandboxing remain outside OKF 0.2 and Wiki Soul V1.

## Next Recommended Slice

Live-test fresh installation, query, and ingestion from clean profiles and
small, large, native-memory, sensitive-source, stale, deprecated, trust-tier,
attested, and interrupted-operation fixtures.
