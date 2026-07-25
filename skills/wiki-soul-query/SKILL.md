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
   project paths plus permission to execute `git`.
5. When the installer created a marked implementation under
   `<skill-dir>/.generated/`, use that implementation if its runtime is
   available and its marker and self-test are valid.
6. Pass the injected project ID with `--project-id <id>` when available.
   Otherwise let the helper derive it from the current repository or path.

Useful options:

```text
--project-id <id>     Use the already resolved Wiki Soul project ID.
--all-projects        Search every project bundle, not only the current one.
--limit <count>       Return at most this many results. Default: 20.
--all                 Return every matching result.
--memory-root <path>  Override the default ~/.agents/memory root.
--project-root <path> Derive identity from this trusted project root.
--self-test           Run isolated built-in fixtures only.
```

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

Matching is deterministic, case-insensitive, accent-insensitive substring
matching. It does not use fuzzy matching, stemming, embeddings, or body text.

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
   explicitly requested.
2. Ignore `index.md`, `log.md`, symlinks, and files without valid concept
   frontmatter containing a non-empty `type`.
3. Read each candidate only from the opening `---` through the closing `---`.
   Do not read its body during candidate selection.
4. Apply the same weights, normalization, coverage bonus, and deterministic
   ordering as the canonical helper.
5. Return compact metadata, choose the few useful concepts, then read those
   bodies.

The manual fallback keeps the skill usable. Report that the fast path is
unavailable; do not install a runtime during ordinary skill use.

## Installer runtime contract

The canonical `scripts/query-memory.mjs` is inspectable UTF-8 source, has no
dependency, carries no executable bit, and is copied with the canonical skill
package.

During install, audit, repair, or update:

1. If Node.js exists, run the canonical helper's isolated `--self-test`.
2. Otherwise test the same file with an already installed compatible Bun or
   Deno runtime.
3. Otherwise, when Python 3 or PowerShell 7 exists, generate an equivalent
   dependency-free implementation in a temporary directory. It must implement
   this CLI, scoring, JSON output, project identity algorithm, read boundaries,
   and self-test contract.
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

Tests must cover the required Wiki Soul project-ID vectors, current versus all
project scope, accent and case normalization, quoted phrases, field weights,
coverage bonus, unknown matching fields, deterministic limits, invalid
frontmatter, symlink exclusion, and proof that body-only terms never match.
