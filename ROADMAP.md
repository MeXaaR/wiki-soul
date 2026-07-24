# Roadmap

## Current Objective

Ship a complete V1 prompt library that installs and operates lightweight,
shared OKF memory through Claude Code, Codex, Cursor, Pi, OpenCode, and a
generic fallback.

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

- Cross-checked against the agreed design and official OKF 0.1 specification.

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

Value: Let Pi bootstrap, test, register, and reload its own Simple Soul
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

## Discovered Follow-ups

- Add adapters for Gemini CLI and other agents.
- Create a separate ingestion skill for existing memories and arbitrary folders.
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

## Next Recommended Slice

Cursor, Pi, and OpenCode support are specified. Next work should live-test
installation from clean profiles, then start only from a real usage need:
another agent adapter or the separate ingestion skill.
