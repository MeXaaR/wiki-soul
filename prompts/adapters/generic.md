# Generic Agent Adapter

Use this adapter only when no certified host adapter exists.

## Goal

Install the Wiki Soul memory core and short global instructions without
inventing an unsupported automatic hook integration.

This adapter supports fresh installation only. During that operation, any
existing Wiki Soul managed block or integration is a pre-existing installation
conflict; do not update, repair, replace, or remove it. A separately invoked
uninstall follows its own explicit removal contract.

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
2. resolve the current project from a trusted host project ID valid under the
   common lowercase syntax, trusted workspace root, or real current working
   directory as defined by the installed Wiki Soul protocol;
3. read the current project index when it exists;
4. retrieve subject indexes and concepts on demand;
5. read the local OKF contract and Wiki Soul protocol before every memory
   write, reorganization, repair, or format ambiguity.

## Report

Report:

- memory core: installed or failed;
- global instructions: installed or unavailable;
- skills: use the main installer's native-loaded or manual-fallback status;
- automatic injection: unsupported;
- overall installation: `partial` when the memory core works without a
  certified hook.

Never imply that automatic injection is active.
