# Generic Agent Adapter

Use this adapter only when no certified host adapter exists.

## Goal

Install the Wiki Soul memory core and short global instructions without
inventing an unsupported automatic hook integration.

## Discovery

Before changing anything:

1. Identify the current agent product and version.
2. Inspect its local, user-global instruction mechanism.
3. Prefer official local documentation or official product documentation.
4. Confirm that the instruction surface is global to the user rather than
   project-local.
5. If no safe global instruction surface can be identified, install the memory
   core only and report the limitation.

Do not guess configuration filenames.

## Instructions

Install the exact managed block supplied by the main installer. Preserve
unrelated content and existing managed blocks from other tools.

Show the target path and diff in the consolidated plan. Apply changes only
after the user's single confirmation.

## Hooks

Do not generate or register a hook.

The contracts under `prompts/hooks/` are not certified for this host until a
dedicated adapter defines:

- supported lifecycle events;
- native configuration and merge behavior;
- input/output contract;
- trust or approval flow;
- isolated and live-verification procedure.

List discovered hooks as `unsupported`, not `failed`.

## Runtime

The global instruction block tells the agent to:

1. read the root memory index at a new session;
2. determine the project ID using the installed protocol;
3. read the current project index when it exists;
4. retrieve subject indexes and concepts on demand;
5. follow the full local protocol before a memory write.

## Report

Report:

- memory core: installed, unchanged, repaired, or failed;
- global instructions: installed, unchanged, or unavailable;
- automatic injection: unsupported;
- overall installation: `partial` when the memory core works without a
  certified hook.

Never imply that automatic injection is active.
