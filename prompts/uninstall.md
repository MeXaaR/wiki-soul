# Uninstall Wiki Soul Integrations

Remove Wiki Soul integrations safely while preserving memory by default.

This is a separate, explicitly requested operation. Fresh-install collision
rules in the installer, adapters, and hook contracts do not prohibit the exact
managed removals authorized here.

## Read Before Acting

Read:

- repository `SPEC.md`;
- `prompts/install.md`;
- the adapter for the current agent;
- every direct `skills/<skill-id>/SKILL.md` package;
- every hook contract under `prompts/hooks/`.

Inspect the current global agent configuration, every exact skill package under
`~/.agents/skills/` carrying a Wiki Soul ownership marker, and generated
assets. Do not assume paths beyond stable Wiki Soul markers and registrations.

## Default Scope

Remove only:

- the instruction block between `<!-- WIKI_SOUL_START -->` and
  `<!-- WIKI_SOUL_END -->` when the adapter used file mode;
- native skill registrations, links, or adapters that point to an exact
  canonical package under `~/.agents/skills/<skill-id>/`;
- canonical skill packages whose `SKILL.md` carries
  `WIKI_SOUL_MANAGED_SKILL_V1 skill=<skill-id>`;
- generated skill runtime source under the exact canonical package whose files
  carry `WIKI_SOUL_GENERATED_SKILL_RUNTIME_V1 skill=<skill-id>`;
- native hook registrations whose command points to the current agent's
  exact content-addressed deployment under `~/.agents/hooks/<agent>/`;
- generated text files that carry
  `WIKI_SOUL_GENERATED_HOOK_V1 adapter=<agent> hook=<hook-id>` and are owned
  by those registrations.

Preserve:

- unrelated global instructions;
- unrelated or ambiguously owned skills and native skill configuration;
- unrelated hooks and configuration fields;
- hook scripts owned by another agent;
- all of `~/.agents/memory/`.

## Plan and Confirmation

Show:

- exact configuration files to edit;
- exact managed block to remove, or confirmation that injected instruction mode
  created no separate instruction entry;
- exact native skill exposures and canonical skill package directories to
  remove;
- exact marked generated skill runtime files to remove;
- exact hook registrations to remove;
- exact generated files or directories to remove;
- confirmation that memory is excluded.

Ask once before modifying global configuration or deleting managed skill or
generated hook assets.

If ownership is ambiguous, stop instead of deleting.

## Apply and Verify

1. Remove only exact managed entries.
2. Preserve original file syntax and unrelated ordering where possible.
3. Remove a native skill exposure only when it resolves to the exact canonical
   package and no unrelated entry shares it.
4. Remove generated skill runtime source only when it is below the exact
   package `.generated/` directory, every affected file carries the exact
   matching skill marker, and no unrelated content would be removed.
5. Remove a canonical skill package only when its exact `SKILL.md` ownership
   marker matches its directory ID and no unmarked or unrelated file would be
   removed. Any unmarked file under `.generated/` makes package removal
   ambiguous. Never remove the parent `~/.agents/skills/` directory.
6. Remove a generated hook file only when its exact registration is gone and its
   ownership marker matches the adapter and hook ID.
7. Remove a revision directory only when it contains no unmarked or unrelated
   file. Never remove the whole agent hook directory merely because it is
   under `~/.agents/hooks/<agent>/`.
8. Reparse edited JSON, TOML, or other native configuration.
9. Confirm the agent starts without a Wiki Soul skill or hook error.
10. Confirm `~/.agents/memory/index.md` remains intact.
11. In injected instruction mode, confirm no Cursor User Rule or other
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
- skills no longer exposed and canonical skill packages removed;
- generated skill runtime alternatives removed;
- hooks unregistered;
- generated assets removed;
- preserved memory path;
- remaining warnings or manual host restart required.
