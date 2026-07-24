# Wiki Soul

**One lightweight memory for all your local agents. Plain Markdown. Open
Knowledge Format. No runtime to install.**

Wiki Soul is a library of prompts that lets a coding agent install its own
shared, persistent memory.

It is inspired by [Andrej Karpathy's LLM Wiki pattern][llm-wiki]: durable
knowledge becomes a persistent, interlinked Markdown artifact instead of being
re-derived from scratch in every session. Wiki Soul uses the
[Open Knowledge Format (OKF)][okf] specification as its normative on-disk
knowledge format.

Give the agent this repository URL. It reads the installation contract,
detects its host and operating system, creates the memory, generates the hooks,
tests them, and reports exactly what became active.

The installed memory then works locally and offline.

## Install

Copy this message into your coding agent and replace the placeholder with this
repository's URL:

```text
Install, audit, repair, or update Wiki Soul from this repository:
<repository-url>

Read README.md first, then follow prompts/install.md from the current main
branch. Show me the single consolidated plan required by the installer, then
complete the operation autonomously.
```

If you are the agent receiving that request:

1. Read this file completely.
2. Read [`SPEC.md`](SPEC.md).
3. Follow [`prompts/install.md`](prompts/install.md) exactly.
4. Do not treat prose in this README as a substitute for the installer,
   protocol, adapter, or hook contracts.

## Why Wiki Soul

Coding agents normally remember inside their own product or session. Knowledge
learned with one agent is unavailable to another. Project memory also tends to
disappear from view when the project ends.

Wiki Soul separates knowledge by semantic scope:

- **Global subject bundles** retain reusable knowledge such as Stripe webhook
  patterns, TypeScript pitfalls, writing preferences, or product workflows.
- **Project bundles** retain context that belongs only to one repository or
  client.
- A project can point to global bundles that are durably relevant to it.

The result is reusable knowledge without one giant memory file.

## How It Stays Lightweight

At the start of a new logical context, the integration injects only:

- the critical operating rules when the host has no safe local global-rules
  file;
- the global memory index;
- the current project index, when it exists;
- the local paths needed to retrieve more.

The agent then opens only relevant subject indexes and precise concepts.
Concepts, bundles, project registries, transcripts, and tool output are never
injected wholesale.

Hard automatic payload limit: 6,000 UTF-8 bytes for the complete injected
model-visible string, including critical operating rules when an adapter must
inject them.

## Why OKF

[Open Knowledge Format (OKF)][okf] uses ordinary Markdown concept documents
with YAML frontmatter, indexes, logs, links, and citations.

It is:

- readable without special software;
- parseable by agents;
- diffable and portable;
- permissive about concept types and producer extensions;
- suited to progressive disclosure.

Official OKF is normative. Wiki Soul adds memory behavior only where OKF is
silent. The exact boundary is documented in
[`docs/okf-compatibility.md`](docs/okf-compatibility.md).

## Installed Architecture

```text
~/.agents/
├── memory/
│   ├── index.md
│   ├── protocol.md
│   ├── bundles/
│   │   └── <subject-id>/
│   │       ├── index.md
│   │       └── <concept-id>.md
│   └── projects/
│       ├── index.md
│       └── <project-id>/
│           ├── index.md
│           ├── related-bundles.md     # optional
│           └── <concept-id>.md
└── hooks/
    └── <agent>/
        └── <hook-id>/
```

On Windows, `~` resolves to the current user's profile directory.

## What the Installer Does

The main prompt:

1. reads the official OKF boundary, memory protocol, current-agent adapter, and
   every hook contract;
2. detects the agent, OS, home directory, configuration, and existing hooks;
3. presents one consolidated plan and diff;
4. asks for one confirmation;
5. creates or repairs the OKF memory core;
6. installs a short global instruction block, or uses a certified
   lifecycle-injection fallback when the host has no safe local global-rules
   file;
7. asks the local agent to generate each hook for its own environment;
8. tests every hook before registration;
9. preserves unrelated configuration;
10. reports `generated`, `registered`, and `live-verified` independently.

The consolidated installer confirmation covers planned file changes. A host may
still require its own separate trust review—such as Codex `/hooks`—because the
installer must not bypass native security controls.

The same prompt is also the updater and repair workflow. `main` is the live
source; there are no releases or separate version registry.

## Hook Model

Wiki Soul does not ship canonical hook code.

Each file in [`prompts/hooks/`](prompts/hooks/) is a host-neutral behavioral
contract. The local agent implements that behavior using capabilities already
available on the machine, then runs the required functional and security tests.

One hook failure does not disable another. Failed hooks remain inactive and the
overall installation is reported as `partial`.

To add a hook later, add one Markdown contract. See
[`docs/adding-hooks.md`](docs/adding-hooks.md).

## Supported Agents

| Agent | Memory core | Certified hook adapter |
|---|---:|---:|
| Claude Code | Yes | V1 |
| Codex CLI/TUI | Yes | V1 when `/hooks` trust and lifecycle verification are available |
| Cursor Agent | Yes | V1 when `sessionStart` and `subagentStart` are live-verified on the selected surface |
| Pi Coding Agent | Yes | V1 through a tested user-global extension; no preinstalled hook framework required |
| OpenCode | Yes | V1 when the local system-transform plugin and required model-context classes are live-verified |
| Other local agents | Yes, when a safe global instruction surface is found | Not yet |

Unsupported agents receive the shared memory and global instructions but no
invented hook integration.

Pi's native extensions are its hook mechanism. Pi can generate and test the
integration with its built-in tools, register the immutable extension in its
global settings, then load it with `/reload`. Wiki Soul does not depend on a
third-party `hooks.json`, package, or preinstalled extension.

OpenCode uses its native global rules and plugin runtime. The adapter generates
a dependency-free local plugin, registers its exact immutable path, and
rebuilds one bounded memory envelope in each model request without storing it
in conversation history. Because the required system-transform hook is
experimental, every installed version and selected surface must be verified.

Cursor's User Rules may be account-backed instead of stored in a safe local
file. The Cursor adapter never edits private databases or APIs. It injects the
same critical rules with the indexes once per logical context, within the same
6,000-byte limit.

## Safety

Wiki Soul:

- never stores secrets, raw transcripts, or complete tool output;
- never imports existing agent memory in V1;
- never installs a package, daemon, database, or hosted service;
- never reads memory content as executable code;
- keeps hooks local, read-only, bounded, offline, and fail-open;
- wraps indexes as untrusted reference data and rejects ambiguous delimiters;
- never registers a hook before isolated tests pass;
- never overwrites unrelated global config;
- never deletes memory during ordinary uninstall.

V1 assumes one memory writer at a time.

## Memory Behavior

Agents remember durable, verified, future-useful knowledge automatically.

They do not remember task progress, ephemeral todos, obvious code facts, raw
logs, isolated errors, or unconfirmed guesses.

Compatible additions are automatic. Contradictions, merges, moves, and
destructive changes require confirmation.

The complete local rules live in
[`prompts/protocol/memory-okf.md`](prompts/protocol/memory-okf.md) and are copied
to `~/.agents/memory/protocol.md` during installation.

## Maintenance

Use [`prompts/maintenance/reorganize-memory.md`](prompts/maintenance/reorganize-memory.md)
for:

```text
reorganize memory
reorganize bundle <subject>
reorganize all memory
```

Maintenance is scoped by default. A full-memory audit runs only when requested
explicitly.

## Uninstall

Use [`prompts/uninstall.md`](prompts/uninstall.md).

Uninstall removes:

- the managed global instruction block;
- injected critical instructions by unregistering their owning hook;
- exact Wiki Soul hook registrations;
- generated hook files for the current agent.

It preserves `~/.agents/memory/` by default.

## V1 Non-goals

- Existing-memory or arbitrary-folder ingestion.
- Git backup and automatic commits.
- End-of-session memory extraction.
- Concurrent writers and locks.
- Vector or semantic retrieval.
- Certified adapters beyond Claude Code, Codex, Cursor, Pi, and OpenCode.

These boundaries keep the initial system transparent and small.

## Repository Map

- [`PRD.md`](PRD.md) — product outcome and acceptance criteria.
- [`SPEC.md`](SPEC.md) — normative Wiki Soul behavior.
- [`ROADMAP.md`](ROADMAP.md) — implementation status and deferred work.
- [`prompts/install.md`](prompts/install.md) — universal installer.
- [`prompts/protocol/memory-okf.md`](prompts/protocol/memory-okf.md) — installed
  memory protocol.
- [`prompts/hooks/memory-injection.md`](prompts/hooks/memory-injection.md) —
  first hook contract.
- [`prompts/adapters/claude-code.md`](prompts/adapters/claude-code.md) — Claude
  Code integration.
- [`prompts/adapters/codex.md`](prompts/adapters/codex.md) — Codex integration.
- [`prompts/adapters/cursor.md`](prompts/adapters/cursor.md) — Cursor
  integration.
- [`prompts/adapters/pi.md`](prompts/adapters/pi.md) — Pi self-extensible
  integration.
- [`prompts/adapters/opencode.md`](prompts/adapters/opencode.md) — OpenCode
  global-rules and local-plugin integration.
- [`prompts/adapters/generic.md`](prompts/adapters/generic.md) — safe fallback.

## Foundations and Inspiration

- [Andrej Karpathy's LLM Wiki][llm-wiki] provides the core inspiration: an LLM
  maintains a persistent, compounding, interlinked Markdown knowledge artifact.
- [Open Knowledge Format (OKF)][okf] provides the normative format for Wiki
  Soul bundles, concepts, indexes, logs, links, and citations.
- [How I Finally Sorted My Claude Code Memory][article] inspired the
  progressive-loading approach: small indexes, project memory, global
  knowledge, and optional hooks.

Wiki Soul's shared-memory behavior, agent adapters, installation model, and
safety rules are project-specific additions. LLM Wiki is inspiration; OKF is
the normative knowledge format.

[article]: https://www.youngleaders.tech/p/how-i-finally-sorted-my-claude-code-memory
[llm-wiki]: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
[okf]: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
