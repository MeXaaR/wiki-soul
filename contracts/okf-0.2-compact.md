---
type: Reference
title: Open Knowledge Format 0.2 — compact normative contract
description: Lossless compact projection of the OKF 0.2 specification used by Wiki Soul.
tags: [okf, specification, contract]
okf_contract_version: "0.2"
source_commit: 3fcbb9f828c2f23d109c855ee403c3a4c81f3a96
source_sha256: 5a3311d270bebb16d558010e75064f5b75323f284992641732b1c8097511f948
---

# Open Knowledge Format 0.2 — Compact Contract

This is a compact, self-contained projection of OKF 0.2. It removes
motivation, repetition, long examples, and the worked example, but preserves
the specification's definitions, structures, defaults, exceptions, normative
requirements, and section meaning. `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`,
and `MAY` retain their source meaning.

Frontmatter records source version, commit, and SHA-256. License: Apache
License 2.0.

## 1. Scope, goals, and non-goals

OKF represents knowledge—the metadata, context, and curated insight around
data and systems—as a human- and agent-readable directory of UTF-8 Markdown
files with YAML frontmatter. It has no schema registry, central authority, or
required tooling. Producers include people, agents, and export pipelines;
consumers include agents, UIs, search indexes, and deterministic code.

Goals:

1. define a universal producer format;
2. inform consumer reading and traversal;
3. facilitate exchange across systems and organizations;
4. standardize the small frontmatter set that makes an agent-maintained corpus
   trustable without prescribing a runtime.

Non-goals:

- fixed taxonomy of concept types;
- storage, serving, or query infrastructure;
- replacement of domain schemas such as Avro, Protobuf, or OpenAPI;
- packaging or invocation standard for executor or attester code. OKF fixes
  the interface, not the packaging.

## 2. Definitions

- **Knowledge Bundle / bundle:** self-contained hierarchical collection of
  knowledge documents; unit of distribution.
- **Concept:** one knowledge unit represented by one Markdown document. It may
  describe a tangible asset, abstract idea, or anything between.
- **Concept ID:** concept file path within its bundle, without `.md`.
- **Frontmatter:** YAML metadata block delimited by `---` at file start.
- **Body:** everything after frontmatter.
- **Link:** standard Markdown link between concepts; expresses relationships
  beyond directory hierarchy.
- **Source:** material from which a concept derives, recorded in `sources`;
  may be internal or external to the bundle.
- **Provenance:** set of a concept's sources.
- **Credibility signal:** objective per-source `author`, `usage_count`, or
  `last_modified` fact used to infer trust. OKF records signals, not verdicts.
- **Actor:** identity string: `<producer>/<version>` for an agent/tool,
  `human:<id>` for a person, or `process:<id>` for an automated process.
- **Trust tier:** level derived from `verified`: unverified,
  machine-confirmed, or human-reviewed.
- **Attested Computation:** concept with `type: Attested Computation` and a
  sanctioned way to compute a value so a consumer can confirm it was run.
- **Executor:** instructions or code that executes a computation and returns a
  receipt.
- **Receipt:** evidence returned by one run, shaped by `executor.receipt`;
  runtime artifact not stored in the bundle.
- **Attester:** deterministic, no-LLM code that inspects a receipt and returns
  a verdict.

## 3. Bundle structure

A bundle is a domain-independent directory tree:

```text
<bundle>/
  index.md                 # optional directory listing
  log.md                   # optional update history
  <concept>.md
  <subdirectory>/
    index.md
    <concept>.md
    ...
```

A bundle MAY be distributed as:

- a Git repository (recommended because it provides history, attribution, and
  diffs);
- a tarball or ZIP archive;
- a subdirectory in a larger repository.

`index.md` and `log.md` are reserved at every hierarchy level and MUST NOT be
used for concept documents. Every other `.md` file is a concept document.
Tags use frontmatter `tags`; OKF defines no separate tag-aggregation file.
Consumers may synthesize tag views by scanning frontmatter.

## 4. Concept documents

Every concept is one UTF-8 Markdown file containing:

1. YAML frontmatter opened and closed by `---` on its own line, starting at
   the first line;
2. a free-form Markdown body.

### 4.1 Frontmatter

```yaml
---
type: <Type name>                  # REQUIRED
title: <Optional display name>
description: <Optional one-line summary>
resource: <Optional canonical URI for the underlying asset>
tags: [<tag>, <tag>, ...]
# Optional provenance, trust, lifecycle, and computation families
# Other producer-defined key/value pairs are allowed
---
```

`type` is the only always-required key. It is a non-empty, short concept-kind
string used for routing, filtering, and presentation. Type values are not
centrally registered. Producers SHOULD choose descriptive, self-explanatory
values. Consumers MUST tolerate unknown types gracefully, normally as generic
concepts. A concept containing only `type` is conformant.

Recommended fields:

- `title`: human-readable display name. If absent, consumers MAY derive it
  from the filename.
- `description`: one-sentence summary for indexes, search snippets, and
  previews.
- `resource`: canonical URI uniquely identifying the described underlying
  asset; absent for abstract concepts.
- `tags`: YAML list of short categorization strings.

Producers MAY add arbitrary keys. Consumers SHOULD preserve unknown keys when
round-tripping and MUST NOT reject documents containing unknown fields.

### 4.2 Body

Body is standard Markdown. No body section is required. Producers SHOULD favor
structural Markdown—headings, lists, tables, and fenced code—over free-form
prose. These headings have conventional meaning and SHOULD be used when
applicable:

| Heading | Meaning |
|---|---|
| `# Schema` | Structured asset columns or fields |
| `# Examples` | Concrete usage examples, often fenced code |
| `# Computation` | Sanctioned Attested Computation |

Per-claim attribution uses Markdown footnotes keyed to `sources[].id`, not a
body citations list.

## 5. Provenance, trust, and lifecycle

All fields in these families are optional. Absence is meaningful but never
makes a concept unconsumable.

### 5.1 `sources` and credibility

```yaml
sources:
  - id: source-id
    resource: https://example.com/material
    title: Material title
    author: team/example
    usage_count: 5000
    last_modified: 2026-05-30
usage_window: { from: 2026-06-01, to: 2026-06-30 }
```

Each source entry:

- `resource`: REQUIRED within the entry. It names an absolute URL,
  bundle-relative path, relative path, `references/` path, or a non-followable
  population/scope descriptor.
- `id`: optional stable attribution key. It SHOULD exist when the body cites
  the source.
- `title`: optional human-readable label.
- `author`: optional source producer, using the actor convention.
- `usage_count`: optional number of times `resource` was exercised during
  `usage_window`. For one artifact, its exercise count; for a scope descriptor,
  exercises within the scope touching the concept.
- `last_modified`: optional source-change date, `YYYY-MM-DD`; distinct from
  concept-change time `generated.at`.

Shared `usage_window: { from, to }` is a sibling of `sources`, contains a date
range, and frames every `usage_count`. An individual source MAY carry its own
`usage_window` to override the shared window.

`usage_count` is a coarse liveness/adoption signal: useful for alive/dead,
order-of-magnitude, and one source's trend, not precise cross-kind ranking.
Consumers SHOULD read it as liveness and trend, not as a score. OKF stores no
credibility score.

Lineage uses links, not a dedicated field. If `resource` points to another OKF
concept, a consumer MAY recurse into that concept's `sources`. External leaves
carry intrinsic signals only. Explicit external `derived_from` and data
lineage are outside v0.2.

For per-claim attribution, footnote label equals `sources[].id`:

```markdown
Claim supported by the source.[^source-id]

[^source-id]: Human-readable source label
```

The label is the stable join key; consumers resolve the matching source entry,
not the footnote prose. Stable keyed labels survive source reordering.

### 5.2 `generated` and `verified`

`generated` records how current content was produced:

```yaml
generated: { by: reference_agent/gemini-2.5-pro, at: 2026-06-20T22:53:05Z }
```

- `generated.by`: REQUIRED within `generated`; actor convention applies.
- `generated.at`: ISO 8601 datetime of last meaningful content change.

`verified` records independent confirmations against sources or `resource`:

```yaml
verified:
  - { by: human:ahormati, at: 2026-06-25T09:00:00Z }
  - { by: process:finance-nightly, at: 2026-06-26T02:00:00Z }
```

Each event has `by` actor and `at` ISO 8601 datetime. Latest `at` gives
verification recency. `verified` is independent of `generated.at`: content may
change without reconfirmation; verification may occur without regeneration.
A single verifier MAY use a bare `{ by, at }` mapping. Consumers MUST treat it
as a one-element list.

### 5.3 Derived trust tier

Derive from `verified`, lowest to highest:

- absent `verified` → **unverified**;
- only non-`human:` actors → **machine-confirmed**;
- at least one `human:<id>` actor → **human-reviewed**.

Concepts without trust frontmatter remain consumable; consumers MUST NOT reject
them. Trust tiers are advisory, not access control.

### 5.4 `status`

```yaml
status: stable   # draft | stable | deprecated
```

- `draft`: not yet reviewed, possibly incomplete.
- `stable`: ready for consumption.
- `deprecated`: retained for links/history, no longer current.
- absent `status` → `stable`.

### 5.5 `stale_after`

```yaml
stale_after: 2026-09-23
```

Optional absolute `YYYY-MM-DD` date. Stale exactly when
`today >= stale_after`. It is not a relative TTL.

## 6. Cross-linking and paths

Concepts MAY link using standard Markdown links:

- absolute bundle-relative: starts `/`, resolved from bundle root;
  recommended because moving the source document within its directory does
  not break it;
- relative: standard Markdown relative path.

A link asserts a relationship; surrounding prose conveys its kind.
Graph-building consumers typically treat links as directed edges of an
untyped relationship. Consumers MUST tolerate broken links; they may represent
not-yet-written knowledge.

Path-valued fields are `resource`, `sources[].resource` when it is a path,
`computation`, `executor.resource`, and `attester.resource`. Each accepts:

- absolute URL;
- bundle-relative path beginning `/`;
- relative path such as `../computations/revenue.md`.

`references/` conventionally mirrors external material, run instructions, or
code as first-class concepts. It is a naming convention, not a requirement.

## 7. Actor convention

Identity fields `generated.by` and `verified[].by` use:

- `<producer>/<version>` for agents and tools;
- `human:<id>` for a person;
- `process:<id>` for an automated process.

Trust classification keys off `human:`. Producers MUST use that prefix for
hand-authored or human-confirmed content.

## 8. Index files

`index.md` MAY appear in any directory, including a bundle root, for
progressive disclosure. It has no frontmatter, except that a bundle-root
`index.md` MAY contain `okf_version` frontmatter.

Body has one or more grouped sections:

```markdown
# Section

* [Title](relative-url) - short description
* [Subdirectory](subdir/) - short description
```

Entries SHOULD include linked concept `description`. Producers MAY generate an
index automatically. Consumers MAY synthesize one when absent.

## 9. Log files

`log.md` MAY appear at any hierarchy level to record the history of changes to
that scope. It is a flat list of date-grouped entries, newest first:

```markdown
# Directory Update Log

## 2026-05-22
* **Update**: Added [Concept](/path/concept.md).
```

Date headings MUST use ISO 8601 `YYYY-MM-DD`. Entries are prose. Leading bold
words such as `**Update**`, `**Creation**`, and `**Deprecation**` are
conventional, not required.

## 10. Attested Computation

An Attested Computation records a sanctioned computation and check interface;
OKF itself executes nothing. It is a standalone
`type: Attested Computation` concept. Consumers link to it with ordinary
Markdown links. Runtime defines parameter binding semantics; one computation
can serve many concepts; trust/lifecycle/attestation remain per computation.

### 10.1 Contract fields

In addition to optional §5 families, these fields define the contract. Fields
are optional unless explicitly marked REQUIRED:

- `runtime`: REQUIRED for this type; describes execution and parameter
  semantics, e.g. `bigquery`, `postgres`, `dbt`, `python`, `Looker`.
- `parameters`: list of typed named holes the agent may fill. Each entry is
  `{ name, type, required }`; binding semantics follow `runtime`.
- `computation`: optional path to a computation file. If absent, the body
  `# Computation` fence supplies the computation.
- `executor`: execution interface. `resource` points to run instructions or
  code. `receipt` declares fields every run must return as evidence for the
  attester.
- `attester`: deterministic check. `resource` points to no-LLM code that takes
  a receipt and returns a verdict consumer-side.

Packaging behind resource paths is producer choice; OKF fixes only the
interface.

Compact shape:

```yaml
---
type: Attested Computation
runtime: bigquery
parameters:
  - { name: year, type: integer, required: true }
executor:
  resource: references/skills/run-on-bq.md
  receipt: [job_id, executed_sql, result]
attester:
  resource: references/attesters/check.py
---
```

### 10.2 Computation forms and binding

Provide a computation using one of two forms:

- inline: one fenced code block under `# Computation`;
- file-backed: set `computation` path and omit the body computation fence.

The agent MAY supply only values for declared `parameters`; it MUST NOT author
or edit the computation. Consumer binds computation plus values into the
executable artifact. Attester independently re-derives that binding and
compares it with the expanded or compiled artifact in the receipt. This makes
rewrites, swapped files, and mutated dependencies detectable.
A rewritten query, swapped computation file, or mutated dependency fails the
check.

Concepts using computed values link to one standalone Attested Computation per
figure. Directory placement does not change the contract.

### 10.3 Informative consumer flow

Runtime artifacts below are not stored in the bundle:

1. discover `type: Attested Computation`;
2. load contract and inline/file computation;
3. let the agent supply declared parameter values;
4. executor runs and returns the declared receipt;
5. consumer runs attester to check computation provenance and displayed-result
   fidelity;
6. gate a failing attestation; warn or refuse when stale; surface successful
   verdict evidence.

This flow is informative, not normative.

### 10.4 Verification versus attestation

`verified` confirms that the definition matches policy; it is document-level,
slow, and stored. Attestation confirms that one run used the sanctioned
computation; it is per-call, runtime, and not stored. A stale definition can
attest successfully; a freshly verified definition still needs attestation
per run.

## 11. Conformance

A bundle is conformant with OKF 0.2 if:

1. every non-reserved `.md` file contains parseable YAML frontmatter;
2. every frontmatter block contains a non-empty `type`;
3. present `index.md` and `log.md` files follow §8 and §9.

When optional provenance, trust, lifecycle, or computation families exist,
producers SHOULD follow §§5–10. Consumers:

- MUST treat bare `verified` mapping as a one-element list;
- MUST NOT reject a concept because an optional family is absent;
- SHOULD derive trust tiers and staleness only from specified fields;
- SHOULD surface, not silently discard, a failing attestation.

Consumers SHOULD treat every other constraint as soft guidance. Consumers MUST
NOT reject a bundle because of:

- missing optional frontmatter fields;
- unknown `type`;
- unknown additional keys;
- broken cross-links;
- missing `index.md`.

## 12. Versioning and deferred work

Version syntax is `<major>.<minor>`:

- minor bump: backward-compatible additions, such as optional fields or
  conventional headings;
- major bump: may break compatibility, such as required-field renames or
  reserved-filename changes.

A bundle MAY declare `okf_version: "0.2"` in bundle-root `index.md`
frontmatter, the only `index.md` frontmatter location. Consumers that do not
understand a declared version SHOULD attempt best-effort consumption rather
than refuse the bundle.

Deferred:

- full receipt/verdict wire protocol and run attestation lifecycle;
- attester ABI, portability, and sandboxing;
- attestation caching;
- semantic-layer templates where attester comparison uses model-and-binding
  equality instead of SQL equality.

## 13. Changes from 0.1

OKF 0.2 supersedes 0.1. It is a minor bump with two deliberate breaking field
changes and consumer fallbacks:

- `timestamp` is superseded by `generated.at`. Consumers MAY fall back to
  `timestamp` only when `generated` is absent.
- body `# Citations` is superseded by frontmatter `sources`. Consumers SHOULD
  read `sources` and MAY parse a 0.1 `# Citations` list.

A 0.1 bundle remains consumable by a 0.2 consumer through these fallbacks.

Additions are optional:

- `sources`, its credibility signals, and `usage_window`;
- `generated`, `verified`, `status`, and `stale_after`;
- `Attested Computation` plus `runtime`, `parameters`, `computation`,
  `executor`, and `attester`;
- conventional `# Computation`;
- actor convention.

Bundle structure, reserved filenames, required `type`, recommended
`title`/`description`/`resource`/`tags`, cross-linking, indexes, logs, and
permissive conformance remain unchanged.

## Coverage table

| Full OKF 0.2 source | Compact contract |
|---|---|
| Preamble, §1 Motivation/Goals/Non-goals | Preamble, §1 |
| §2 Terminology | §2 |
| §3 Bundle structure, §3.1 Reserved filenames | §3 |
| §4 Concept documents, §4.1 Frontmatter, §4.2 Body | §4 |
| §4.3–4.4 examples | Shapes retained in §§4–5; long examples omitted |
| §5 and §5.1–5.5 | §5 and §5.1–5.5 |
| §6 and §6.1–6.3 | §6 |
| §7 Actor convention | §7 |
| §8 Index files | §8 |
| §9 Log files | §9 |
| §10 and §10.1–10.6 | §10 and §10.1–10.4 |
| §11 Conformance | §11 |
| §12 Versioning, Considered and deferred | §12 |
| §13 and §13.1–13.2 | §13 |
| Appendix A worked example | No new rules; omitted by compact projection |
