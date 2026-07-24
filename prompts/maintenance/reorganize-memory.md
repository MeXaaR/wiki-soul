# Reorganize Simple Soul Memory

Use this prompt to maintain an installed Simple Soul memory. Follow the local
`~/.agents/memory/protocol.md` before acting.

## Determine Scope

Interpret the user's request:

- `reorganize memory` → current project bundle and global bundles referenced by
  its `related-bundles.md`;
- `reorganize bundle <subject>` → the named global bundle only;
- `reorganize all memory` → root catalog, all global bundles, and all project
  bundles.

Do not widen the scope silently.

## Inspect

Within scope, inspect:

- OKF frontmatter and required `type`;
- index accuracy and retrieval descriptions;
- duplicate or contradictory concepts;
- stale and deprecated concepts;
- files beyond the soft 200-line or 8-KiB review threshold;
- broken internal links;
- project-to-global references;
- forbidden or unnecessarily sensitive content;
- unnecessary logs or index churn.

Do not ingest transcripts, unrelated folders, or vendor memory.

## Plan

Before changing anything, produce a concise plan grouped as:

- safe additive or formatting repairs;
- proposed merges, moves, splits, or deletions;
- unresolved contradictions;
- links or citations needing user knowledge.

Show affected files. Ask one confirmation for the complete destructive portion.

## Apply

- Make compatible additive repairs directly.
- Preserve unknown OKF frontmatter fields.
- Keep global bundles independent.
- Keep inter-bundle references one-way from project `related-bundles.md` to
  global bundles.
- Update an index only for structural or retrieval-description changes.
- Use `log.md` only for meaningful history.
- Delete obsolete content after confirmation.
- Use deprecation only when transition or history remains useful.

## Validate

Validate every changed concept and affected index. For `reorganize all memory`,
also verify the root catalog and project registry.

If validation fails, repair or restore the previous content before continuing.

## Report

Return:

- scope inspected;
- files changed;
- concepts created, merged, split, deprecated, or removed;
- indexes repaired;
- unresolved issues;
- confirmation that no out-of-scope bundle was modified.
