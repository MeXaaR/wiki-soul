# Cursor adapter

Use this guide only when the current host is Cursor. It adapts the common
memory protocol and every hook contract in this repository to the installed
Cursor environment.

The current official Cursor documentation and the installed Cursor version are
authoritative for Cursor-specific behavior. If either conflicts with this
guide, stop before changing Cursor configuration, report the exact conflict,
and leave the affected hook unregistered.

## Authority and scope

1. Read the root installer, installed memory protocol, and every direct
   `../hooks/*.md` contract completely.
2. Treat official OKF as authoritative for knowledge format.
3. Install only user-global Cursor integration. Do not create `AGENTS.md`,
   `.cursor/rules/`, `.cursor/hooks.json`, or any other file in a client
   project.
4. Do not read, import, migrate, disable, or delete the content of Cursor's own
   memories or User Rules.
5. Do not install packages or a new runtime.
6. Generate the smallest local hook implementation for the detected machine;
   never copy canonical hook code from this repository.
7. Keep normal operation local, offline, read-only, bounded, and fail-open.

## Verify the installed Cursor contract

Before proposing changes:

1. Detect the exact Cursor application and Cursor Agent CLI versions that will
   use the integration.
2. Read the current official Cursor Rules and Hooks documentation.
3. Inspect the installed hook schema when Cursor exposes it.
4. Confirm all of these current expectations instead of assuming them:
   - the user hook file is `<home>/.cursor/hooks.json`;
   - its top-level schema uses `version: 1` and a `hooks` object;
   - `sessionStart` accepts command hooks and returns model-visible
     `additional_context`;
   - `subagentStart` accepts command hooks and returns model-visible
     `user_message`;
   - command entries support an explicit timeout and `failClosed: false`;
   - Cursor can display the effective hook source and execution history in
     Settings → Hooks.
5. If an expected field, event, path, or output is absent, use only a
   documented equivalent that satisfies the common contract. Otherwise report
   the hook as `unsupported`.

At the time this adapter was written, Cursor 3.3.x exposed the contract above.
That observation is informative, not a substitute for installation-time
verification.

Resolve the actual user home through the operating system. Do not infer
Windows paths from POSIX conventions and do not assume Bash, PowerShell 7,
Python, Node.js, or a JSON utility exists.

## Inspect without modifying

Inspect:

- `<home>/.cursor/hooks.json`;
- the effective Cursor hook inventory across user, project, team, enterprise,
  plugin, and imported compatibility sources;
- Cursor's hook policy, enablement, and execution history;
- the availability and storage model of Cursor User Rules through supported
  Cursor surfaces, without reading their content;
- `<home>/.agents/hooks/cursor/`;
- the installed Wiki Soul memory root and protocol;
- available local runtimes and their exact command semantics.

In current injected mode, modify only `<home>/.cursor/hooks.json` and marked
generated files under `<home>/.agents/hooks/cursor/`. A future file mode may
also modify only the documented user-global instruction file selected by this
adapter.

Cursor may also discover project, team, enterprise, plugin, or compatibility
hooks. Inspect those sources for a competing memory injection, but never edit
them. A collision outside the user source is still a real collision.

Because this adapter does not read account-backed User Rule contents, report
that this collision audit excludes their prose. Do not claim otherwise.

Do not edit Cursor databases, SQLite files, workspace storage, account caches,
application bundles, or private API state.

## Critical instructions without a private Cursor API

Cursor User Rules may be account-backed rather than represented by a stable
local text file. This adapter MUST NOT automate them through an internal
database or private network API.

When the installed Cursor version does not expose a documented, local,
user-global instruction file that can be merged safely and idempotently:

1. Use the adapter fallback authorized by the main installer.
2. Render the canonical critical rules from
   [`../install.md`](../install.md#7-install-the-critical-global-instructions)
   without the HTML boundary comments.
3. Replace the memory and protocol placeholders with validated native absolute
   paths.
4. Put those rules in one `WIKI SOUL OPERATING RULES V1` section immediately
   before the common `WIKI SOUL REFERENCE DATA V1` envelope.
5. Return the combined text through `sessionStart.additional_context` and
   `subagentStart.user_message`.
6. Keep the complete model-visible output, including the operating rules,
   reference envelope, indexes, and diagnostics, within the common 6,000-byte
   limit.

This is one injection per logical context, not one injection per turn or tool.
It preserves local autonomous installation without adding project rules or
depending on Cursor's account memory.

If a future Cursor version provides a documented local user-global instruction
file, the installer MAY use the normal marked-file method after proving it is
loaded. It MUST then omit the injected operating-rules section. Never install
both modes.

Treat the instruction mode as:

- `injected`: no separate instruction file; loading is proven only by live
  hook verification;
- `file`: one marked local instruction block is safely installed and proven
  loaded.

Do not report critical instructions as loaded merely because their text exists
inside generated source.

## Cursor lifecycle mapping

For `memory-injection`, prefer Cursor's native events:

- `sessionStart` for every new Agent conversation, including supported
  background-agent contexts;
- `subagentStart` for every subagent type.

Do not add a matcher to either entry. Current Cursor versions run
`sessionStart` for all start triggers and do not support Claude-style
`startup`, `resume`, `clear`, or `compact` matcher filtering.

Map successful output as follows:

- `sessionStart` → one JSON object with `additional_context`;
- `subagentStart` → one JSON object with `user_message` and no restrictive
  `permission`.

Use the exact snake-case fields documented by the installed Cursor version.
Never emit both a Cursor-native output and a nested Claude compatibility output
unless the installed schema explicitly requires that representation.

The handler must finish before the first model request in the new logical
context. Do not use `beforeSubmitPrompt`, `preToolUse`, or `postToolUse` when
the native lifecycle events satisfy the contract.

Cursor may retain the session-start context across resume and compaction rather
than firing a second start event. Prove the installed surface keeps the
injected context after resume and compaction. If it does not, use the smallest
documented lifecycle fallback. Do not invent a per-tool reinjection.

Build an explicit planned-event set from the detected native events and any
required fallback. Registration and live verification apply to that set.

## Project location

Treat all hook input as untrusted, including `workspace_roots`, `cwd`,
`conversation_id`, `subagent_id`, repository metadata, and paths.

For project detection:

1. Prefer one validated absolute workspace root supplied by Cursor.
2. If `cwd` is supplied and belongs to exactly one workspace root, use that
   workspace root.
3. Otherwise use a validated absolute `cwd`, then the nearest Git root.
4. If a multi-root workspace remains ambiguous, inject global memory and an
   explicit project-routing diagnostic instead of guessing a project ID.

Ignore `prompt`, `task`, `transcript_path`, `agent_transcript_path`,
attachments, tool data, and account identity. Never open a transcript.

## Generate the local hook

Generate each implementation in a temporary candidate directory outside the
memory root. For memory injection, use the stable hook id
`memory-injection`.

After all isolated tests pass, promote the complete candidate to:

```text
<home>/.agents/hooks/cursor/<hook-id>/revisions/<digest>/
```

Follow the main installer's ownership marker and content-addressing algorithm.
Never edit a deployed revision in place.

The implementation must:

- satisfy the complete common hook contract;
- read one JSON object from standard input;
- validate every used field and ignore all unused sensitive fields;
- read only the authorized global and project `index.md` files;
- never read the protocol, concepts, Cursor rules, prompts, tasks, transcripts,
  attachments, or tool content;
- make no network request;
- execute no memory or project content;
- use no dynamic command evaluation;
- prevent path traversal and symlink escape;
- emit exactly one valid Cursor JSON object on standard output;
- keep diagnostics off standard output except for the documented structured
  field;
- return exit status `0` and `failClosed: false` behavior for every failure;
- emit no partial memory after an error;
- reserve enough of the 6,000-byte budget for the injected critical rules when
  instruction mode is `injected`;
- remain usable with spaces, Unicode, and native Windows paths.

Cursor command hooks run with the user's permissions. Review the generated
source for unnecessary capabilities before testing it.

## Test before registration

Run every acceptance and security test from the common hook contract in
isolated temporary fixtures, plus:

1. Feed a realistic `sessionStart` input with Cursor's current fields,
   including `workspace_roots`.
2. Feed a realistic `subagentStart` input containing adversarial `task` and
   transcript paths; prove neither is read or reflected.
3. Verify `sessionStart` emits exactly one JSON object with one complete
   `additional_context` string.
4. Verify `subagentStart` emits exactly one JSON object with one complete
   `user_message` string and no denying permission.
5. Verify the two outputs carry the same project identity and reference
   envelope.
6. In injected instruction mode, verify the canonical operating-rules section
   appears once, before the reference-data envelope, in both outputs.
7. Verify the combined output at 5,999 and 6,000 UTF-8 bytes is accepted and
   6,001 bytes produces the contract's diagnostic-only form without
   truncation.
8. Verify no debug text precedes or follows JSON.
9. Verify one, zero, and multiple workspace roots behave deterministically and
   that ambiguous multi-root input never selects a project arbitrarily.
10. Verify the exact command works through Cursor's own command-hook runtime,
    working directory, environment, and quoting semantics.
11. Verify repeated invocation, separate conversations, background-agent
    input, and separate subagent IDs do not leak state across contexts.
12. Verify no real memory file or client project changes.

An implementation reaches `generated: yes` only after every applicable test
passes and the promoted production path passes one final invocation.

## Merge the user hook configuration

Parse `<home>/.cursor/hooks.json` structurally. If it is absent, create the
smallest valid user configuration only after the candidate passes. If it is
invalid, stop without rewriting it.

For each planned event:

- preserve every unrelated key, event, command, prompt hook, matcher, and
  ordering when practical;
- add one command entry pointing to the exact absolute content-addressed
  deployment;
- set a short explicit timeout proven sufficient by tests;
- set `failClosed: false` explicitly;
- omit matchers for `sessionStart` and `subagentStart`;
- update a prior exact Wiki Soul entry in place;
- never duplicate an exact command;
- never replace an existing event array;
- never weaken enterprise or team policy.

Detect Wiki Soul ownership through the exact command path and the generated
source marker. A missing or unmarked prior target is a conflict.

After writing, parse the file again, compare the structural diff with the
approved plan, and use Cursor Settings → Hooks to prove the entries resolve
from the User source. A file that merely parses is not yet `registered`.

Cursor normally watches hook configuration, but a new Agent conversation is
still required to trigger `sessionStart`.

## Live verification

Do not infer execution from files or unit tests.

1. Start a real new Cursor Agent conversation in a disposable test workspace.
2. Confirm Settings → Hooks records the user `sessionStart` command, success
   exit, and bounded output.
3. Prove the first model context received the correct memory root, project ID,
   global index, project index or absence, protocol path, and—when used—the
   operating-rules section.
4. Start a real Cursor subagent and prove it receives the same routed context
   through `user_message`.
5. Resume the conversation and exercise compaction when safely possible; prove
   the original session context remains available or the documented fallback
   reinjects once.
6. Confirm no memory or project file changed.

Certify Cursor application Agent and Cursor Agent CLI surfaces separately.
Evidence from one surface does not prove the other.

Status meanings:

- `generated`: the deployed local implementation passed all isolated tests;
- `registered`: Cursor recognizes every planned user hook entry;
- `live-verified`: every planned lifecycle class executed successfully and the
  intended model-visible context was observed;
- `instructions loaded`: the selected `injected` or `file` mode was observed
  in a real model context.

If a real subagent or compaction cannot be exercised, keep `live-verified: no`
and the overall result `partial`. Never call the hook active early.

The main installer also requires every discovered skill to be native-loaded or
have a ready manual fallback. A pending or failed skill makes the overall
result `partial`.

In injected instruction mode:

- a safely registered hook awaiting live proof is `partial`;
- an unsupported or unregistrable memory-injection hook leaves no critical
  instruction path and makes the overall installation `failed`;
- a runtime failure remains fail-open for Cursor work and is reported as a
  degraded memory context.

## Failure and recovery

Runtime failure must leave Cursor usable:

- exit successfully in the host's non-blocking form;
- inject no partial index or operating-rules fragment;
- expose no prompt, task, transcript, credential, remote URL, or environment
  dump;
- emit one short safe diagnostic in the documented model-visible field;
- recommend rerunning the main installer.

If an update discovers that the current registered implementation no longer
passes, preserve it only when it still conforms to the current contract.
Otherwise remove only its exact registration and report the hook as failed.

## Update, repair, and uninstall

On rerun, reread repository `main`, official Cursor documentation, the current
schema, and every hook contract. Leave a conforming deployment unchanged.
Deploy changed code at a new digest path and update only exact registrations.

Uninstall this adapter by:

1. removing only exact user hook entries whose targets are under
   `<home>/.agents/hooks/cursor/` and carry the expected ownership marker;
2. removing a marked local instruction block only when instruction mode
   `file` was used;
3. removing no Cursor User Rule in injected mode;
4. deleting only unreferenced marked generated files and no directory
   containing an unowned file;
5. preserving every project, team, enterprise, plugin, compatibility, and
   unrelated user hook;
6. preserving all Cursor memories and User Rules;
7. preserving `<home>/.agents/memory/`.

Uninstall remains a planned, confirmed global change. Memory deletion is a
separate destructive operation.

## Final report

Return one row per hook with `generated`, `registered`, and `live-verified`
states. Also report:

- Cursor version and certified surface;
- detected OS, home, and existing runtime used;
- user hook configuration path;
- instruction mode and whether it was live-loaded;
- native events and any fallback;
- isolated and live tests;
- policy, collision, reload, subagent, or compaction limitations;
- overall `complete`, `partial`, or `failed` status;
- confirmation that client projects, Cursor memories, User Rules, transcripts,
  and unrelated configuration were untouched.

## Official Cursor references

- [Hooks](https://cursor.com/docs/agent/hooks)
- [Rules](https://cursor.com/docs/context/rules)

If these URLs or their current content have moved, locate the replacement only
on Cursor's official documentation domain and update this adapter before
registration. Never guess a changed schema.
