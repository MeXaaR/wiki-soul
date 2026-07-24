# Uninstall Wiki Soul Integrations

Remove Wiki Soul integrations safely while preserving memory by default.

## Read Before Acting

Read:

- repository `SPEC.md`;
- `prompts/install.md`;
- the adapter for the current agent;
- every hook contract under `prompts/hooks/`.

Inspect the current global agent configuration and generated assets. Do not
assume paths beyond stable Wiki Soul markers and registrations.

## Default Scope

Remove only:

- the instruction block between `<!-- WIKI_SOUL_START -->` and
  `<!-- WIKI_SOUL_END -->` when the adapter used file mode;
- native hook registrations whose command points to the current agent's
  exact content-addressed deployment under `~/.agents/hooks/<agent>/`;
- generated text files that carry
  `WIKI_SOUL_GENERATED_HOOK_V1 adapter=<agent> hook=<hook-id>` and are owned
  by those registrations.

Preserve:

- unrelated global instructions;
- unrelated hooks and configuration fields;
- hook scripts owned by another agent;
- all of `~/.agents/memory/`.

## Plan and Confirmation

Show:

- exact configuration files to edit;
- exact managed block to remove, or confirmation that injected instruction mode
  created no separate instruction entry;
- exact hook registrations to remove;
- exact generated files or directories to remove;
- confirmation that memory is excluded.

Ask once before modifying global configuration or deleting generated hook
assets.

If ownership is ambiguous, stop instead of deleting.

## Apply and Verify

1. Remove only exact managed entries.
2. Preserve original file syntax and unrelated ordering where possible.
3. Remove a generated file only when its exact registration is gone and its
   ownership marker matches the adapter and hook ID.
4. Remove a revision directory only when it contains no unmarked or unrelated
   file. Never remove the whole agent hook directory merely because it is
   under `~/.agents/hooks/<agent>/`.
5. Reparse edited JSON, TOML, or other native configuration.
6. Confirm the agent starts without a Wiki Soul hook error.
7. Confirm `~/.agents/memory/index.md` remains intact.
8. In injected instruction mode, confirm no Cursor User Rule or other
   unrelated instruction was removed.

## Memory Deletion

Memory deletion is not uninstall.

If the user separately asks to delete memory:

1. resolve and display the exact absolute memory path;
2. state that deletion removes durable knowledge and is irreversible without a
   separate backup;
3. require explicit confirmation for that exact path;
4. never use an unresolved home variable, broad glob, or recursive parent
   directory;
5. report what was removed and whether recovery is possible.

## Report

Return:

- integration status;
- instruction mode and instructions removed;
- hooks unregistered;
- generated assets removed;
- preserved memory path;
- remaining warnings or manual host restart required.
