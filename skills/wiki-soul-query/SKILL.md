---
name: wiki-soul-query
description: Search installed Wiki Soul OKF memory through tags, descriptions, and all YAML frontmatter, rank candidate concepts, then read only the few concepts needed to answer. Use when the user asks to search, find, retrieve, or verify what Wiki Soul knows about a topic. Do not use for general codebase search.
---

<!-- WIKI_SOUL_MANAGED_SKILL_V1 skill=wiki-soul-query -->

# Wiki Soul Query

Find relevant Wiki Soul concepts without loading the memory corpus into
context. Keep the query stage read-only.

## Query the metadata

1. Resolve the directory containing this `SKILL.md` as `<skill-dir>`.
2. Build a short query from the user's entities, product names, technical
   terms, and useful synonyms. Keep an intended multi-word phrase as one
   argument.
3. Prefer the canonical helper when Node.js is available:

   ```text
   node <skill-dir>/scripts/query-memory.mjs [options] <term...>
   ```

4. Bun may run the same file after its self-test passes. Deno may run its
   self-test with write access limited to the isolated temporary fixture, then
   run production queries with read access limited to the skill, memory, and
   project paths.
5. When the installer created a marked implementation under
   `<skill-dir>/.generated/`, use that implementation if its runtime is
   available and its marker and self-test are valid.
6. Pass the injected project ID with `--project-id <id>` when available.
   Otherwise pass the trusted workspace root with `--project-root <path>`.
   Without either option, the helper uses the real current working directory.
   For an ambiguous multi-root context, pass `--global-only`.

Useful options:

```text
--project-id <id>     Use the already resolved Wiki Soul project ID.
--all-projects        Search every project bundle, not only the current one.
--global-only         Search global bundles only; use for ambiguous workspace routing.
--limit <count>       Return at most this many results. Default: 20.
--all                 Return every matching result.
--memory-root <path>  Override the default ~/.agents/memory root.
--project-root <path> Derive identity from this trusted workspace root.
--self-test           Run isolated built-in fixtures only.
```

Project identity is independent of workspace tooling:

1. `--global-only` means no project identity is selected;
2. a valid explicit `--project-id` from a trusted host surface always wins; it
   must be one lowercase ASCII path segment of 1–64 characters, start and end
   with a letter or digit, and contain only letters, digits, and hyphens;
3. an invalid explicit ID is unavailable, then a valid `--project-root` is used
   directly as the trusted workspace root;
4. otherwise the real current working directory is used;
5. the selected path must be an existing real absolute directory; a relative,
   missing, inaccessible, or non-directory root is unavailable;
6. its canonical form uses `/`, Unicode NFC, and no trailing slash except for a
   filesystem root; on Windows, lowercase the complete path with the runtime's
   locale-independent Unicode lowercase operation;
7. derive the slug from the basename with Unicode NFKD, combining-mark
   removal, lowercase, runs outside `[a-z0-9]` replaced by `-`, `-` trimming,
   a 48-character limit, another trim, and `project` when empty;
8. append `-` and the first eight lowercase hexadecimal characters of the
   canonical path's UTF-8 SHA-256.

Two distinct canonical paths are two distinct project contexts. Hosts that
need identity independent of location must provide an explicit project ID.
When several host workspace roots remain ambiguous, use `--global-only`; do
not pass a project ID or choose an arbitrary root or current directory.

Use `--all-projects` only when the user asks for cross-project knowledge or
when that wider scope is clearly required. Do not broaden scope merely because
the first query returned no result.

## Select, then read

The helper searches only frontmatter and never searches or returns Markdown
bodies. It ranks:

- `tags`: weight 10;
- `description`: weight 5;
- every other frontmatter field: weight 1;
- each additional distinct matched term: coverage bonus 3.

Relevance always wins. Results tied on score and matched-term coverage use
these OKF v0.2 signals, in order:

1. lifecycle: `stable`, then `draft`, then `deprecated`;
2. freshness: not stale before stale, then current verification before a
   verification made obsolete by a newer `generated.at`;
3. trust: `human-reviewed`, then `machine-confirmed`, then `unverified`;
4. current-project scope, global scope, other-project scope, then path.

No lifecycle, freshness, or trust signal filters a result. `deprecated`,
stale, unverified, and partially populated concepts remain searchable.

Matching is deterministic, case-insensitive, accent-insensitive substring
matching. It does not use fuzzy matching, stemming, embeddings, or body text.
Every frontmatter field remains searchable, including nested v0.2 structures
such as `sources`, `generated`, `verified`, `executor`, and `attester`.

Each result carries these derived OKF v0.2 signals:

- `status`: the declared lifecycle value, or `stable` when absent;
- `stale`: true when today's local calendar date is on or after a valid
  `stale_after`; `staleAfter` also reports the declared value when present;
- `trustTier`: `unverified` without a verifier, `machine-confirmed` when all
  verifiers are non-`human:` actors, or `human-reviewed` when any verifier is
  a `human:` actor;
- `lastVerifiedAt`: the latest valid ISO 8601 verification datetime, when
  present;
- `verificationOutdated`: true only when valid `generated.at` and
  `lastVerifiedAt` values exist and generation is newer.

The helper accepts both the single-mapping and list forms of `verified`.
Quoted and unquoted `by` and `at` keys are accepted. Only events where the
same mapping contains a valid OKF actor and a valid ISO 8601 calendar datetime
in `at` contribute to `trustTier` or `lastVerifiedAt`. An actor must contain no
whitespace or control character and be `human:<id>`, `process:<id>`, or exactly
two non-empty `<producer>/<version>` segments. Malformed, incomplete,
duplicate-key, invalid-actor, and scalar lookalike events are ignored.
Likewise, `generated.at` affects `verificationOutdated` only when its own
mapping also contains a valid `generated.by`.

The dependency-free helper is not a complete YAML implementation. Before
indexing, it conservatively validates the YAML subset used by Wiki Soul and
OKF v0.2: top-level mappings, quoted or simple keys, scalar and flow values,
indented mappings and lists, and block scalars. Unbalanced delimiters or
quotes, tabs in indentation, invalid top-level lines, and indented content
under a top-level scalar make the candidate ineligible. This structural check
still stops at the closing frontmatter delimiter and never reads a body.
Missing or malformed optional v0.2 fields alone do not invalidate an otherwise
structurally valid concept.

Use the returned `path`, `scope`, metadata, score, and matched fields to select
the smallest useful set of concepts. Read only those concept files, normally
one to five. Stop when there is enough evidence to answer. If results are noisy
or empty, revise the terms and query again before reading more files.

Answer the user's question from the selected concepts. Distinguish stored
knowledge from any inference and cite the relevant local concept paths when
useful.

## Manual fallback

When no runnable helper exists:

1. Search only `<memory-root>/bundles/` and
   `<memory-root>/projects/<current-project-id>/`, unless all projects were
   explicitly requested. For ambiguous multi-root routing, search only
   `<memory-root>/bundles/`.
2. Ignore `index.md`, `log.md`, symlinks, and files without valid concept
   frontmatter containing a non-empty `type`.
3. Read each candidate only from the opening `---` through the closing `---`.
   Do not read its body during candidate selection.
4. Apply the same weights, normalization, coverage bonus, and deterministic
   relevance ordering as the canonical helper.
5. Derive the same v0.2 signals and tie-breakers. Treat a bare `verified`
   mapping as one event, accept a verification list, default absent `status`
   to `stable`, and compare `stale_after` with today's local calendar date.
   Count only complete, valid, per-mapping `{by, at}` events and require both
   fields in `generated`. Apply the same conservative structural validation.
   Do not reject or hide stale, deprecated, unverified, or unknown
   structurally valid frontmatter.
6. Return compact metadata and derived signals, choose the few useful
   concepts, then read those bodies.

The manual fallback keeps the skill usable. Report that the fast path is
unavailable; do not install a runtime during ordinary skill use.

## Installer runtime contract

The canonical `scripts/query-memory.mjs` is inspectable UTF-8 source, has no
dependency, carries no executable bit, and is copied with the canonical skill
package.

During fresh installation:

1. If Node.js exists, run the canonical helper's isolated `--self-test`.
2. Otherwise test the same file with an already installed compatible Bun or
   Deno runtime.
3. Otherwise, when Python 3 or PowerShell 7 exists, generate an equivalent
   dependency-free implementation in a temporary directory. It must implement
   this CLI, scoring, v0.2 signal derivation and tie-breakers, JSON output,
   project identity algorithm, read boundaries, and self-test contract.
4. Put this language-appropriate ownership text within the first 512 UTF-8
   bytes of generated source:

   ```text
   WIKI_SOUL_GENERATED_SKILL_RUNTIME_V1 skill=wiki-soul-query
   ```

5. Run isolated fixtures before promoting the tested source atomically to:

   ```text
   <skill-dir>/.generated/query-memory.<ext>
   ```

6. Never place unmarked generated content there. Preserve unrelated or
   ambiguously owned content and report a conflict.
7. If no compatible runtime exists, offer an exact optional Node.js
   installation plan with source, command, destination, network and machine
   impact. Wait for explicit approval. Never install a runtime automatically.
8. If the user declines or installation fails, retain the manual fallback and
   report only that the fast path is unavailable.

Tests must cover explicit project-ID priority and invalid-ID fallback, trusted
absolute directory workspace-root and current-directory fallback, POSIX,
Windows-drive and UNC-root path canonicalization, distinct-path identity,
ambiguous multi-root global-only behavior, current versus all project scope,
accent and case normalization, quoted phrases, field weights, coverage bonus,
unknown matching fields, deterministic limits, invalid frontmatter, symlink
exclusion, and proof that body-only terms never match.
They must also cover mapping and list forms of `verified`, human and machine
trust tiers, stale and fresh concepts, generation newer than verification,
absent and deprecated status, nested `sources`, and deterministic v0.2
tie-break ordering. Parser fixtures must cover malformed and incomplete
events, quoted internal keys, scalar spoof strings, invalid calendar
datetimes, invalid actor conventions, `generated` without an actor, and
structurally invalid frontmatter.
