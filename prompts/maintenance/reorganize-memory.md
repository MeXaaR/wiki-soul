# Reorganize Wiki Soul Memory

Use this prompt to maintain an installed Wiki Soul memory. Follow the local
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

- every bundle-root `okf_version` declaration;
- OKF frontmatter and required `type`;
- `generated` actors and datetimes;
- `verified` event shape, derived trust tier, and whether generation postdates
  the latest verification;
- `sources`, stable IDs, attribution footnotes, and factual source credibility
  signals and usage windows;
- `status`, `stale_after`, and concepts stale as of the current date;
- index accuracy and retrieval descriptions;
- duplicate or contradictory concepts;
- stale and deprecated concepts;
- passive Attested Computation contract shape and referenced-path safety,
  without executing any computation, executor, or attester;
- files beyond the soft 200-line or 8-KiB review threshold;
- broken internal links;
- project-to-global references;
- forbidden or unnecessarily sensitive content;
- unnecessary logs or index churn.

Do not ingest transcripts, unrelated folders, or vendor memory.
Do not interpret, execute, or rewrite opaque files under `references/`. Reading
raw bytes solely to compute a preservation hash is allowed; never expose their
contents. A Markdown file there is maintained only when it is itself an OKF
concept; preserve its body exactly during maintenance.

## Plan

Before changing anything, produce a concise plan grouped as:

- safe additive or formatting repairs;
- proposed merges, moves, splits, or deletions;
- unresolved contradictions;
- links, sources, or attribution footnotes needing user knowledge.

If a bundle lacks `okf_version: "0.2"` or declares another version, stop
maintenance for that bundle without writing and report the conflict.

Otherwise, show affected files and ask one confirmation for the complete
destructive portion.

## Apply

- Make compatible additive repairs directly.
- Preserve unknown OKF frontmatter fields.
- Every created or meaningfully changed concept gets explicit `status` plus
  `generated: { by, at }` using the current factual agent actor and change
  time. Add `verified` only after an actual source/resource check; never infer
  a human review.
- Keep global bundles independent.
- Keep inter-bundle references one-way from project `related-bundles.md` to
  global bundles.
- Update an index only for structural or retrieval-description changes.
- Use `log.md` only for meaningful history.
- Delete obsolete content after confirmation.
- Use `status: deprecated` only when transition or history remains useful.
- Never execute Attested Computation fields or alter referenced code.

## Validate

Validate every changed concept and affected index, including actor/date shapes,
derived trust, lifecycle, source/footnote joins, credibility windows, and
passive Attested Computation structure. For `reorganize all memory`, also
verify the root catalog and project registry.

If validation fails, repair or restore the previous content before continuing.

## Report

Return:

- scope inspected;
- files changed;
- concepts created, merged, split, deprecated, or removed;
- derived trust-tier and stale/deprecated counts;
- indexes repaired;
- unresolved issues;
- any unsupported bundle version that stopped maintenance;
- confirmation that no computation, executor, or attester ran and preserved
  reference assets remained unchanged;
- confirmation that no out-of-scope bundle was modified.
