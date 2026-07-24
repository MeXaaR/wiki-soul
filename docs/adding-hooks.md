# Adding a Hook Contract

Simple Soul discovers hooks from Markdown files under `prompts/hooks/`. There is
no manifest and no canonical hook source code.

Adding one hook should require one new Markdown contract.

## File Rules

- Use one stable ASCII `kebab-case` filename.
- Do not add a general `README.md` inside `prompts/hooks/`; every `.md` file is
  treated as an installable contract.
- Keep the contract host-neutral.
- Do not include a preferred implementation that agents will copy blindly.
- Declare dependencies explicitly. Prefer independent hooks.

## Required Sections

Every hook contract must define:

1. Identity
2. Purpose
3. Non-goals
4. Logical lifecycle
5. Inputs
6. Files or resources accessed
7. Output or side effects
8. Size and performance bounds
9. Runtime failure behavior
10. Security requirements
11. Pre-registration acceptance tests
12. Registration requirements
13. `generated`, `registered`, and `live-verified` criteria
14. Live verification
15. Removal

If a section does not apply, say why rather than omitting it.

## Adapter Contract

Every certified adapter must enumerate all `.md` files in `prompts/hooks/`.
For each hook it must:

- map logical events to current host events;
- choose a zero-unnecessary-dependency implementation for the local OS;
- generate marked text sources under
  `~/.agents/hooks/<agent>/<hook-id>/revisions/<digest>/`;
- run the contract's complete applicable test suite;
- register only after tests pass;
- perform host trust or approval;
- attempt live verification;
- report status independently.

When a host cannot implement a contract safely, report that hook as
`unsupported` and leave it unregistered.

## Independent Activation

One failed or unsupported hook does not disable conforming hooks.

The overall install is:

- `complete` when every discovered hook is live-verified;
- `partial` when the memory core works but any hook is pending, failed, or
  unsupported;
- `failed` when the memory core or critical instructions cannot be installed
  safely.

## Review Checklist

Before merging a new hook contract:

- Does the feature belong in a hook rather than the memory protocol?
- Can it fail open?
- Is its input smaller than the transcript?
- Does it avoid secrets and unnecessary environment access?
- Are all reads, writes, network calls, and subprocesses declared?
- Can the installer prove behavior without touching real memory?
- Can the hook be removed without deleting memory or unrelated config?
- Have Claude Code, Codex, Cursor, Pi, and OpenCode adapter implications been
  reviewed?

## Deferred Examples

Potential future contracts:

- `backup-git.md`
- `memory-health-warning.md`
- `memory-extraction.md`

These are not part of V1 until their behavior and safety tests are specified.
