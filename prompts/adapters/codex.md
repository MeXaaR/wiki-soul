# Codex adapter

Use this prompt when the current host is Codex. It adapts the common memory
protocol and every hook contract in this repository to the installed Codex
environment.

You are the installer, auditor, updater, repairer, and uninstaller for this
adapter. Work autonomously after the user approves the installer's single
overall plan. Ask again only for a real conflict, a destructive action, or an
administrative restriction that changes the requested outcome.

## Authority and scope

1. Treat the official OKF specification as authoritative for memory format.
2. Treat the local memory protocol installed by the main prompt as
   authoritative for Wiki Soul behavior.
3. Treat current official Codex documentation and the installed Codex version
   as authoritative for Codex integration.
4. Read every Markdown contract in `../hooks/`. Install each hook independently.
   Start with [`../hooks/memory-injection.md`](../hooks/memory-injection.md).
5. Do not import, inspect, or migrate Codex's own memory store.
6. Do not add files to client repositories. Install only global user
   integration.
7. Do not install packages or introduce a new runtime. Generate an
   implementation suited to the OS and runtimes already available.
8. Never copy a prewritten hook implementation from this repository. Design
   the smallest local implementation that satisfies the contract, then prove
   it with tests.

## Discover the active Codex environment

Before proposing changes:

1. Detect the OS, available shells/runtimes, installed Codex version, and actual
   user home directory. Do not infer Windows behavior from a POSIX shell path.
2. Resolve `CODEX_HOME`. Use its configured value when present; otherwise use
   Codex's documented default, `~/.codex`.
3. Inspect, without modifying:
   - both global instruction candidates, `AGENTS.override.md` and `AGENTS.md`;
   - global `config.toml`;
   - global `hooks.json`;
   - the hooks feature state and any managed-only policy;
   - the resolved `/hooks` inventory across user, profile, project, plugin, and
     managed sources, including other memory hooks;
   - the target directory `~/.agents/hooks/codex/` (or its native equivalent).
4. Codex loads `AGENTS.override.md` instead of `AGENTS.md` at global scope when
   the override is non-empty. Audit both files for Wiki Soul markers, then
   maintain exactly one block across the pair in the file Codex actually loads:
   - use the existing non-empty `AGENTS.override.md` when active;
   - otherwise use the existing `AGENTS.md`;
   - create `AGENTS.md` only when neither active file exists.
   If a valid block exists only in the inactive file, include its exact move to
   the active file in the consolidated diff. Damaged or duplicated blocks
   across the pair are a conflict.
5. For hooks, preserve the representation already used by the global Codex
   layer:
   - if only `hooks.json` exists, merge there;
   - if only inline hooks in `config.toml` exist, merge there;
   - if neither exists, prefer global `hooks.json`;
   - if both forms already exist, do not create another source. Choose the
     existing source that contains this adapter's prior entries, or
     `hooks.json` when this is a fresh install, and report Codex's existing
     mixed-source warning.
6. Stop registration, but not generation or isolated testing, when policy
   disables user hooks or allows managed hooks only. Report the exact
   restriction. Never weaken managed policy.
7. This V1 adapter is certified for Codex CLI/TUI when `/hooks`, documented
   trust review, and the required lifecycle events can be exercised. On an app
   or IDE surface that cannot expose those checks, install the memory core but
   keep the hook `partial` or `unsupported`; do not infer trust or execution.

## Plan and safe merge

Present one compact plan and one combined diff before any global modification.
Include:

- the active global instruction file;
- the chosen Codex hook configuration source;
- generated script paths under the native equivalent of
  `~/.agents/hooks/codex/`;
- every discovered hook contract and its intended Codex events;
- tests that must pass before registration;
- any restart, new-session, or `/hooks` trust step that will remain.

After approval:

- parse JSON or TOML structurally; never edit it by blind string replacement;
- preserve all unrelated keys, comments when the chosen parser permits it,
  hooks, matchers, ordering, and user instructions;
- never replace an existing hook collection;
- identify this integration by exact generated script paths;
- detect an existing equivalent definition and update it in place;
- never duplicate a handler on rerun;
- stop and explain when another memory-injection hook would create ambiguous or
  duplicate context;
- use the resolved `/hooks` inventory to detect collisions outside the chosen
  user source; modify only the chosen user source and warn that a later project
  or plugin can introduce a new collision;
- keep each hook independent, so one failed hook does not prevent conforming
  hooks from being registered.

## Install the global instruction block

Insert or update exactly one copy across both global candidates of the
canonical managed block from
[`../install.md`](../install.md#7-install-the-critical-global-instructions) in
the active global instruction file. Do not maintain an adapter-specific copy.

Use the native absolute path in place of `~` when that makes the instruction
unambiguous. Keep marker names exact. Preserve all content outside the markers.
If only one marker exists, treat the block as damaged and stop for conflict
resolution instead of guessing its boundary.

## Generate each hook

For every `../hooks/*.md` file:

1. Read the entire contract and derive a stable hook identifier from its
   filename.
2. Inspect the current official Codex hook schema for the installed version.
3. Choose the smallest safe implementation supported by the current OS and
   available runtime.
4. Generate it in a new temporary candidate directory outside memory. Preserve
   a prior working implementation until the candidate passes.
5. Add the required Wiki Soul ownership marker, compute the deployment digest
   defined by the main installer, and after all isolated tests pass promote it
   to `~/.agents/hooks/codex/<hook-id>/revisions/<digest>/`. Test it once from
   that production path and never modify that revision in place.
6. Make all command paths absolute. Handle spaces, non-ASCII user directories,
   Windows quoting, and Codex sessions started from subdirectories.
7. Use Codex's JSON input on standard input and its documented structured
   output. Never parse the transcript. Never rely on transcript format.
8. Keep production hooks local, read-only, network-free, and fail-open.
9. Give each handler a short timeout appropriate to local index reads. Do not
   rely on Codex's long default timeout.
10. Do not register this hook yet.

No generated hook may execute memory content, construct shell commands from a
repository name, follow paths outside the permitted memory root, expose
secrets, or emit partial memory context after an error.

## Codex lifecycle mapping for memory injection

For `memory-injection`, use native Codex lifecycle events when the installed
version supports them:

- `SessionStart` for `startup`, `resume`, `clear`, and `compact`;
- `SubagentStart` for every subagent type.

These cover a new thread, resumed context, cleared or compacted context, and a
new subagent context. The handler must inject once per logical context, not once
per tool or turn.

If an installed Codex version lacks one of these events or cannot return
model-visible additional context from it:

1. verify that absence against the installed version and current official
   documentation;
2. choose the narrowest supported fallback that can inject additional context;
3. prefer the first eligible local tool event only when its output schema
   supports model-visible additional context;
4. use a session-scoped temporary marker to prevent repeated injection;
5. keep the marker outside the memory tree, and never use transcript contents;
6. document the fallback, extra cost, and verification evidence in the final
   report.

Do not add a fallback merely as defensive duplication when native events work.
Never inject before every tool.

## Required tests before registration

Test generated hooks in an isolated temporary environment. Use fixtures, not
the user's live memory, for destructive or malformed-input cases.

Every hook must pass its own contract. The memory-injection implementation must
also prove:

1. correct memory-root resolution on the current OS;
2. stable project ID from a Git remote and the documented
   `directory-name + short-path-hash` fallback;
3. equivalent identity for supported URL forms of the same Git remote;
4. correct handling of no repository, no remote, missing memory root, missing
   project bundle, empty index, and malformed input;
5. loading only the allowed global and current-project `index.md` files;
6. the exact bounded payload required by the common contract, with no concept
   files, full bundles, transcript data, or invented status banner;
7. no silent truncation and no partial ambiguous output when the payload is too
   large or a read fails;
8. one injection for each logical context and no duplicate injection;
9. correct behavior for `startup`, `resume`, `clear`, `compact`, and
   `SubagentStart` fixtures;
10. read-only behavior for the entire memory tree;
11. path-containment checks, hostile repository names, spaces, non-ASCII
    paths, and native Windows path/command quoting when on Windows;
12. no network access, secret reads, transcript reads, or execution of memory
    content;
13. fail-open behavior: exit successfully, emit one concise diagnostic, and
    let Codex continue without memory;
14. valid Codex structured output within both the common 6,000 UTF-8-byte
    additional-context limit and Codex's current model-visible hook-output
    limit.
15. the fixed untrusted-data envelope, reserved-delimiter rejection, invalid
    UTF-8/control rejection, adversarial-index fixture, and exact
    5,999/6,000/6,001 UTF-8-byte boundaries from the common contract.

Also validate the proposed configuration in a temporary copy:

- JSON/TOML remains valid;
- all unrelated configuration is byte-equivalent where practical and
  semantically equivalent otherwise;
- existing hooks remain present;
- rerunning the merge creates no duplicate;
- the command resolves to the generated script on the current OS;
- every registered event and matcher is supported by the installed Codex
  version.

Any failed test leaves that hook unregistered. Revise its implementation and
rerun the failed test plus the complete hook suite. Never lower a test or
activate a known failure to finish installation.

## Register, trust, and verify

Track each hook separately:

- `generated`: implementation exists and all isolated tests pass;
- `registered`: its definition was merged into the active global Codex hook
  source and the resulting configuration validates;
- `live-verified`: Codex executed the real lifecycle event and the intended
  context was observed.

Only a `generated` hook may become `registered`.

After registration:

1. Confirm hooks are enabled in user configuration. If the user-controlled
   feature flag is explicitly off, include enabling it in the approved diff;
   never override an administrative restriction.
2. Use Codex `/hooks` to inspect sources and review the exact new or changed
   definition.
3. Ask the user to trust it through `/hooks` when Codex requires review. Do not
   use `--dangerously-bypass-hook-trust` as an installation shortcut.
4. Codex trust covers the hook definition hash, not the contents of a script at
   an unchanged command path. The content-addressed deployment path therefore
   makes every changed implementation a changed definition. Review the new
   definition; never claim that editing a script in place invalidates trust.
5. Trigger a real supported event in a new or resumed Codex context and confirm
   the expected memory payload is visible.
6. Verify `SubagentStart` with a real subagent. If the surface cannot create
   one, keep `live-verified: no` and the installation `partial`.
7. Never report `live-verified` based only on unit tests, config presence, or
   successful trust review.

Also verify the instruction block is actually loaded, not merely present:

1. inspect the effective instruction-file byte budget, including
   `project_doc_max_bytes` and the default documented limit when unchanged;
2. ensure the complete managed block falls inside the loaded global file
   budget;
3. start a fresh Codex context and use the official instruction-summary or
   equivalent diagnostic to prove the Wiki Soul rules are loaded;
4. report `installed` separately from `live-loaded`, and keep the overall
   status `partial` until loading is proven.

If the current session cannot reload hooks, stop at `registered`, state that a
new Codex session is required, and give one precise verification action.

Report overall installation as:

- `complete` only when instructions are live-loaded and every requested hook is
  `live-verified`;
- `partial` when at least one hook is usable but another is failed, awaiting
  trust, awaiting restart, or not live-verified;
- `partial` when memory core and global instructions work but no hook was
  registered;
- `failed` only when the memory core or critical global instructions could not
  be installed safely.

## Runtime failure behavior

All generated hooks must fail open:

- never block a session, subagent, compaction, or tool;
- return no partial memory payload;
- show one short diagnostic per logical context, including the failing path or
  check but no sensitive content;
- allow Codex to continue without injected memory;
- recommend rerunning the main installer to audit and repair the integration.

Do not silently claim that memory was loaded.

## Update and repair

On rerun:

1. reread `main`, the common protocol, this adapter, and every hook contract;
2. audit the active instruction block, generated scripts, registration,
   trust-visible state, and live behavior;
3. leave conforming local implementations unchanged;
4. regenerate only implementations that no longer satisfy their contracts;
5. show one combined diff before changing global files;
6. rerun complete tests for every changed hook;
7. preserve each unchanged hook's registration and status;
8. deploy changed implementations at a new digest path and report that the
   resulting changed definition requires renewed `/hooks` review.

Do not add an independent version registry or manifest.

## Uninstall this adapter

Uninstall only Codex integration:

1. inspect both global `AGENTS.override.md` and `AGENTS.md`, then remove every
   unambiguous exact
   `<!-- WIKI_SOUL_START -->` … `<!-- WIKI_SOUL_END -->` block from the
   pair; stop if either file has damaged, duplicate, or overlapping markers;
2. structurally remove only hook handlers whose exact generated paths belong
   to `~/.agents/hooks/codex/` and whose targets carry the matching ownership
   marker; treat a missing or unmarked target as an ownership conflict;
3. preserve surrounding matcher groups when they still contain other handlers;
4. preserve an empty matcher group when its ownership cannot be proven; never
   infer ownership merely because Wiki Soul removed its last handler;
5. delete only unreferenced generated files carrying the matching ownership
   marker under `~/.agents/hooks/codex/`; remove no directory that contains an
   unmarked or unrelated file;
6. preserve every unrelated instruction, hook, config key, and managed policy;
7. preserve `~/.agents/memory/` by default;
8. require separate explicit confirmation before any memory deletion.

Uninstallation must be idempotent. Report absent elements as already removed,
not as errors.

## Final report

Return a compact table with one row per hook:

| Hook | Generated | Registered | Live verified | Notes / next action |
|---|---:|---:|---:|---|

Also report:

- active Codex home and global instruction file;
- both instruction files audited and whether instructions are live-loaded;
- selected hook configuration source;
- detected OS and chosen existing runtime;
- whether `/hooks` trust or a new session remains;
- any policy conflict or fallback;
- overall status: `complete`, `partial`, or `failed`.

Never describe a hook as active unless it is `live-verified`.

## Official Codex references

- [Hooks](https://learn.chatgpt.com/docs/hooks.md)
- [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md.md)
- [Advanced configuration: hooks](https://learn.chatgpt.com/docs/config-file/config-advanced#hooks)
- [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)

If current official documentation or the installed Codex schema differs from
this adapter, stop before registration, explain the exact incompatibility, and
update the adapter contract before proceeding. Never guess a hook field.
