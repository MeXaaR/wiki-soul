# Claude Code adapter

Use this guide only when the host agent is Claude Code. It adapts the common
memory protocol and hook contracts to Claude Code without prescribing a
platform-specific implementation.

The official Claude Code documentation is authoritative for Claude-specific
behavior. If this guide conflicts with current official documentation, stop,
report the conflict, and do not register the affected hook.

## Required inputs

Before changing the system:

1. Read the root installer and the local memory protocol selected by it.
2. Read every hook contract selected by the root installer. For memory
   injection, read
   [`../hooks/memory-injection.md`](../hooks/memory-injection.md) completely.
3. Inspect the current Claude Code version and current official documentation.
4. Detect the operating system, user home directory, available local runtimes,
   shell behavior, and filesystem conventions.
5. Inspect, without modifying:
   - the resolved Claude configuration root's `settings.json`;
   - the resolved Claude configuration root's `CLAUDE.md`;
   - `~/.agents/hooks/claude-code/`;
   - the installed memory root and protocol path.

Resolve `claude-config-root` once: use a valid absolute `CLAUDE_CONFIG_DIR`
when configured, otherwise `<home>/.claude` (on Windows, the home is normally
`%USERPROFILE%`). Use that root consistently for settings, instructions,
inspection, verification, and uninstall. `CLAUDE_CONFIG_DIR` does not relocate
`<home>/.agents/`.

Use `/hooks` and accessible configuration sources to inspect the resolved hook
inventory across user, project, local, managed-policy, plugin, skill, and agent
scopes. Modify only the user configuration root. Report a collision from
another scope instead of creating duplicate memory injection.

Resolve paths through the host environment. Do not assume Unix tools, Bash,
Python, Node.js, PowerShell 7, or any optional JSON utility exists.

Do not inspect, import, migrate, disable, or delete Claude Code auto-memory.
It is outside this installer.

## Native Claude Code mapping

Use native events when the installed Claude Code supports them:

- Register the memory injection handler on `SessionStart`. It must handle
  `startup`, `resume`, `clear`, and `compact`. When the installed version
  documents `fork`, handle and test that source too; older versions may report
  equivalent behavior as `resume`.
- Register the same logical hook on `SubagentStart` for every subagent type.
  Do not restrict it to known agent names.
- Return context using the event-specific
  `hookSpecificOutput.additionalContext` field with the matching
  `hookEventName`.
- Keep the generated handler synchronous. Injection must complete before the
  first model request in the new context.

`SessionStart` is the correct path after a resume or compaction. Do not add a
second `PostCompact` injection when `SessionStart` with source `compact` is
available. `SubagentStart` is required because built-in Explore and Plan
subagents do not load `CLAUDE.md`, while the event can inject context directly
into their isolated conversations.

If the installed version lacks one of these capabilities:

1. Prefer upgrading Claude Code.
2. If upgrade is unavailable, derive the smallest fallback from the common
   hook contract and current official events. A first-tool fallback may use
   `PreToolUse`, keyed by `session_id` and, inside a subagent, `agent_id`.
3. Inject at most once per logical context. If native lifecycle events cannot
   reliably identify a new context, report that limitation instead of claiming
   full support.
4. Label degraded coverage in the final report. Never silently emulate an
   unsupported lifecycle.

Do not add a fallback when native events already meet the contract.

Build an explicit planned-event set from the native events and any required
fallback. Registration and live verification apply to that set, not to a
hard-coded pair when the host is degraded.

## Generate the local hook

Generate the implementation for the detected machine. Do not copy a
prewritten hook from this repository and do not treat an example from the
official documentation as production code.

Store generated files under:

`~/.agents/hooks/claude-code/<hook-id>/revisions/<digest>/`

For memory injection, use the stable hook id `memory-injection`. Choose the
language, extension, launcher, and command form from capabilities actually
present on the machine. On Windows, Claude Code supports command hooks using
PowerShell, but use it only after confirming the available PowerShell version.

Add the installer-required ownership marker to every generated text source or
launcher. Compute the deployment digest from the complete candidate, promote
only to that immutable content-addressed directory, and never edit a deployed
revision in place.

The implementation must:

- satisfy the complete common contract;
- read JSON from standard input and validate all used fields;
- prefer a validated absolute `CLAUDE_PROJECT_DIR` as project-location input;
  otherwise use event `cwd`, then the nearest Git root according to the common
  contract;
- ignore `transcript_path` and never read a transcript;
- treat `session_id`, `agent_id`, `agent_type`, `cwd`, repository metadata,
  paths, index contents, and all hook input as untrusted data;
- use absolute, quoted paths and prevent path traversal;
- never construct or execute a command from a project name, remote URL, memory
  content, or computed project id;
- perform no network access;
- execute no memory content;
- read only the permitted memory `index.md` files;
- never write inside the memory root;
- emit only valid Claude Code hook output on standard output;
- keep diagnostics off standard output when structured JSON is emitted;
- stay below both the common payload limit and Claude Code's hook-output limit;
- fail open with exit status `0` and exactly one valid JSON object for every
  registered event;
- on failure, use only a concise `systemMessage`, inject no partial context,
  and never emit `continue: false`, `decision`, or exit status `2`.

Command hooks execute with the user's full permissions. Review the generated
source for unnecessary capabilities before testing it.

## Test before registration

Create and test a candidate implementation before editing
`<claude-config-root>/settings.json`. Use a temporary test area outside the
memory root. Do not replace a previously working generated implementation
until the candidate passes.

Run every acceptance and security test from the common hook contract, plus
these Claude-specific tests:

1. Feed realistic `SessionStart` inputs for `startup`, `resume`, `clear`, and
   `compact`.
2. Feed a realistic `SubagentStart` input containing both `agent_id` and
   `agent_type`.
3. Verify each successful response is valid JSON containing the exact event
   name and one complete `additionalContext` string.
4. Verify no debug text precedes or follows the JSON.
5. Verify repeated delivery to the same logical context does not duplicate the
   payload when the chosen design needs a once-per-context marker.
6. Verify different session and subagent identifiers remain independent.
7. Verify missing optional fields, absent project memory, invalid Git metadata,
   no Git remote, non-Git directories, spaces, Unicode, and Windows-style paths
   do not crash the handler.
8. Verify oversized indexes trigger the contract's explicit degraded payload,
   never silent truncation.
9. Verify malformed input, unreadable indexes, and unexpected filesystem
   objects fail open with no partial context.
10. Verify memory files remain byte-for-byte unchanged.
11. Verify the implementation makes no network call and does not open the
    transcript path supplied in test input.
12. Verify the command form works through the same runtime and shell semantics
    Claude Code will use.
13. Verify a changed event `cwd` does not change project identity while a valid
    `CLAUDE_PROJECT_DIR` remains fixed.
14. Verify the fixed untrusted-data envelope, delimiter and control-character
    rejection, adversarial index, and exact 5,999/6,000/6,001 UTF-8-byte
    boundaries from the common contract.
15. Feed every member of the planned-event set, including version-conditional
    `fork` and any fallback, and prove the exact exit-0 JSON failure behavior.

An implementation receives status `generated` only after all applicable
isolated tests pass. If any required test fails, keep it unregistered, report
the failing case, revise the implementation, and retest.

## Install global instructions

Install the exact short managed block from
[`../install.md`](../install.md#7-install-the-critical-global-instructions) in
the user-level file `<claude-config-root>/CLAUDE.md`. Do not maintain an
adapter-specific copy of that block, and do not add files to client projects.

Use these exact boundary markers:

`<!-- WIKI_SOUL_START -->`

`<!-- WIKI_SOUL_END -->`

Claude Code strips block-level HTML comments before injecting `CLAUDE.md`, so
the markers identify managed content without spending model context.

Replace the path placeholders with native absolute paths. Do not prefix the
protocol path with `@`: Claude Code treats `@path` as an import and would load
the full protocol into every session.

Installation and update rules:

- If both markers are absent, append one block without altering existing text.
- If exactly one marker exists, markers are duplicated, or they overlap another
  managed block, stop and report the conflict.
- If one valid block exists, update it in place.
- Re-running the installer must produce no duplicate block and no unrelated
  change.

Confirm the global instructions load using `/context` in a real Claude Code
session. `/memory` can be used to inspect the user instruction file.

## Merge hook registration

Claude Code user hooks belong under the `hooks` key in
`<claude-config-root>/settings.json`. Do not write hooks to `~/.claude.json`,
and do not create a standalone user `hooks.json`.

Before editing:

1. Parse the existing file as JSON. If parsing fails, stop without rewriting it.
2. Preserve every unrelated key, hook event, matcher group, handler, and array
   entry.
3. Detect prior Wiki Soul registrations by the exact managed script path.
4. Detect a competing memory-injection hook. If its interaction cannot be
   proven safe, stop and report the conflict.
5. Show the structural diff as part of the installer's single approved plan.

After the candidate passes tests:

- merge one handler for every member of the planned-event set;
- use an absolute managed script path and the command form validated on this
  machine;
- preserve existing handlers for every touched event;
- update an existing exact Wiki Soul registration in place;
- never add duplicate handlers;
- never change `disableAllHooks`, managed policy, permissions, or unrelated
  settings to force activation.

If `allowManagedHooksOnly`, another managed policy, or `disableAllHooks`
prevents execution, do not bypass it. Report the hook as not registered or not
live, as appropriate.

Write the merged JSON safely, parse it again, and verify that only the approved
structural changes occurred. A hook receives status `registered` only when:

- the generated implementation still passes its tests;
- every exact handler in the planned-event set is present;
- Claude Code recognizes `<claude-config-root>/settings.json`;
- existing configuration remains intact.

Use `/hooks` to inspect the resolved hook sources and `/status` to confirm the
active settings source. Claude Code watches settings files and normally reloads
hook changes, but a new session is still needed to trigger `SessionStart`.

## Live verification

Do not equate file creation or registration with execution.

Verify through real Claude Code lifecycle events with debug logging enabled:

1. Trigger a real new-session `SessionStart`. `claude --init-only` with a debug
   file is an official low-impact way to exercise startup hooks when supported.
2. Confirm the hook matched, exited successfully, and emitted one complete
   payload with the expected memory root, project id, global index, optional
   project index, and protocol path.
3. Trigger a real `SubagentStart` in a disposable verification task and confirm
   the subagent receives its payload before its first prompt.
4. Confirm no memory file changed.
5. Keep resume, clear, compact, error, and path variants covered by the
   isolated tests unless the environment can exercise them safely.

Status meanings:

- `generated`: candidate exists and all applicable isolated tests pass;
- `registered`: Claude Code configuration contains the tested handler;
- `live-verified`: every required lifecycle-event class was observed with the
  correct payload. For V1 native coverage this requires both a real
  `SessionStart` and a real `SubagentStart`.

If a fresh session or user action is required, stop at `registered: yes,
live-verified: no`, give one precise final verification action, and never claim
`live-verified` early. If no real subagent can be started, keep the installation
`partial`.

## Fail-open and recovery

The memory integration must never prevent Claude Code, a prompt, a tool, a
resume, compaction, or a subagent from continuing.

If the installed hook fails:

- emit no partial memory context;
- show one short diagnostic with the failing path or condition;
- avoid repeated warnings in the same logical context;
- leave Claude Code operational;
- instruct the user to rerun the root installer to audit and repair.

If an installed implementation fails the current acceptance tests during an
update, do not leave that failing candidate registered. Preserve unrelated
configuration and report the hook status as `failed`. Preserve a previous
implementation only if it still passes the current contract; otherwise remove
only its exact managed registrations.

## Idempotent uninstall

Uninstall only the Claude Code integration:

1. Remove the single valid block between `WIKI_SOUL_START` and
   `WIKI_SOUL_END` from `<claude-config-root>/CLAUDE.md`.
2. Remove only hook handlers whose command resolves to the exact managed path
   under `~/.agents/hooks/claude-code/` and whose target carries the matching
   ownership marker. A missing or unmarked target is an ownership conflict.
3. Preserve an empty matcher group or event container when its ownership cannot
   be proven; never infer ownership merely because Wiki Soul removed its last
   handler.
4. Delete only unreferenced generated files carrying the matching ownership
   marker; remove no directory containing an unmarked or unrelated file.
5. Preserve all unrelated Claude settings, instructions, hooks, and files.
6. Preserve `~/.agents/memory/` unconditionally unless a separate, explicit
   destructive request targets it.

Malformed or ambiguous markers and registrations are conflicts: stop rather
than guessing. Re-running uninstall after success must make no further changes.

## Final report

Report:

- detected Claude Code version and operating system;
- paths inspected and changed;
- instruction-block result;
- one row per hook with independent `generated`, `registered`, and
  `live-verified` yes/no/not-applicable fields plus notes;
- native events and any fallback used;
- isolated and live tests run;
- conflicts, policy restrictions, degraded coverage, or remaining verification
  action;
- confirmation that no client-project file, unrelated existing memory content,
  transcript, vendor memory system, or unrelated configuration was modified.

If several hook contracts are installed, keep their statuses independent. One
failed hook makes the overall installation `partial`; it must not disable
another conforming hook.

Use the main installer's overall status rules: `complete` only when the
instruction block is proven loaded, every discovered skill is native-loaded or
has a ready manual fallback, and all discovered hooks are live-verified;
`partial` when memory works but instructions are not proven loaded or any skill
or hook is pending, unsupported without its required fallback, or failed; and
`failed` only when the memory core or critical global instructions could not be
installed safely.

## Official references

- [Hooks reference](https://code.claude.com/docs/en/hooks.md): lifecycle events,
  input/output schemas, `SessionStart`, `SubagentStart`, hook security, Windows
  PowerShell behavior, debugging, and output limits.
- [Claude Code settings](https://code.claude.com/docs/en/settings.md): user
  settings location, scope, precedence, reload behavior, and Windows path
  resolution.
- [How Claude remembers your project](https://code.claude.com/docs/en/memory.md):
  user-level `CLAUDE.md`, loading behavior, imports, `/context`, and `/memory`.
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents.md):
  isolated subagent context and the behavior of built-in Explore and Plan
  agents.
- [Debug your configuration](https://code.claude.com/docs/en/debug-your-config.md):
  hook placement, settings diagnostics, and common configuration failures.
