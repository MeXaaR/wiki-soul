# Open Knowledge Format compatibility

This document defines the boundary between the vendored **Open Knowledge
Format (OKF) 0.2** specification and conventions added by Wiki Soul.

It is based on the immutable local
[OKF 0.2 snapshot](../vendor/okf/0.2/SPEC.md), pinned and documented in its
[provenance record](../vendor/okf/0.2/README.md). That snapshot is normative
for this framework release. Upstream changes are reviewed only through a
deliberate maintainer update and never during user installation.

## 1. Compatibility principle

OKF standardizes a minimal foundation:

- a **Knowledge Bundle** is a self-contained, hierarchical collection of
  knowledge documents;
- a **concept** is a UTF-8 Markdown file with YAML frontmatter;
- `type` is the only always-required frontmatter field;
- `index.md` and `log.md` are reserved filenames;
- Markdown links express relationships;
- `sources` and matching Markdown footnotes express provenance and per-claim
  attribution;
- `generated`, `verified`, derived trust tiers, `status`, and `stale_after`
  express trust, lifecycle, and freshness;
- source metadata can carry objective credibility signals;
- `Attested Computation` describes a sanctioned computation and its
  verification interface without prescribing an execution runtime;
- indexes support progressive disclosure;
- consumers remain permissive toward unknown types, fields, broken links, and
  absent optional metadata.

OKF does not standardize:

- personal or agent memory;
- global versus project memory;
- project identification;
- hooks, context injection, or context budgets;
- rules deciding what is worth remembering;
- a closed taxonomy for `type`;
- identities or relationships across bundles;
- storage, search, locking, or concurrent writes;
- executor packaging, receipt wire formats, attester ABI, or sandboxing.

Every behavior in the second list belongs to the Wiki Soul protocol.

## 2. Conformance units

Each global topic and each project is an autonomous OKF 0.2 bundle.

```text
~/.agents/memory/
├── index.md                         # Lightweight Wiki Soul catalogue
├── protocol.md                      # Local Wiki Soul protocol
├── bundles/
│   ├── stripe/                      # Autonomous OKF 0.2 bundle
│   │   ├── index.md
│   │   ├── log.md                   # Optional
│   │   ├── webhook-signatures.md
│   │   └── subscriptions.md
│   └── typescript/                  # Autonomous OKF 0.2 bundle
│       ├── index.md
│       └── esm-gotchas.md
└── projects/
    ├── index.md                     # Complete project catalogue
    └── github-com-acme-shop/        # Autonomous OKF 0.2 bundle
        ├── index.md
        ├── related-bundles.md
        └── payment-architecture.md
```

The OKF conformance units are:

- every direct child of `bundles/`;
- every project directory under `projects/`.

Each unit's root `index.md` declares:

```yaml
---
okf_version: "0.2"
---
```

The declaration is optional in official OKF but required by the Wiki Soul
profile. It is the only frontmatter allowed in an OKF index.

`~/.agents/memory/` is a Wiki Soul container and catalogue, not one Knowledge
Bundle. The root `index.md` and `projects/index.md` are orchestration
catalogues outside the autonomous bundle boundaries. `protocol.md` is
installation-managed. These files do not receive `okf_version`.

This boundary keeps every topic and project independently distributable, as
intended by the official
[bundle structure](../vendor/okf/0.2/SPEC.md#3-bundle-structure).

## 3. Root catalogue and progressive disclosure

`~/.agents/memory/index.md` stays small. It contains:

- a link to the local protocol;
- one entry per global topic bundle;
- a rich, concise description for each bundle;
- one link to the project catalogue.

It does not list every project. The hook computes the current `project-id` and
opens the matching project bundle index directly. `projects/index.md` is read
only on demand. There is no second global catalogue under `bundles/`.

Example:

```markdown
# Protocol

- [Memory protocol](protocol.md) — Rules for reading, writing, validating, and maintaining memory.

# Global knowledge bundles

- [Stripe](bundles/stripe/) — Stripe payments, Checkout, subscriptions, invoices, and webhook validation.
- [TypeScript](bundles/typescript/) — TypeScript configuration, typing, compilation, ESM, and testing patterns.

# Projects

- [Project catalogue](projects/) — Complete catalogue of project-specific memory bundles.
```

Wiki Soul adds no `Use when:` field. Routing relies on titles, descriptions,
and natural-language terms. This supports the official
[index purpose](../vendor/okf/0.2/SPEC.md#8-index-files)
without creating a proprietary dialect.

## 4. Concept documents

Inside a bundle, every `.md` file other than `index.md` and `log.md` is an OKF
concept. It must:

1. use UTF-8 encoding;
2. start with parseable YAML frontmatter delimited by `---`;
3. contain a non-empty `type`;
4. contain a free-form Markdown body.

Wiki Soul's 0.2 profile additionally requires explicit `status`. It requires
`generated` on every new or meaningfully changed concept.

```markdown
---
type: Playbook
title: Stripe webhook signature validation
description: Reliable validation of Stripe webhook signatures and common failure modes.
tags: [stripe, webhooks, security]
status: stable
generated: { by: "codex/5.6", at: 2026-07-25T14:30:00Z }
verified:
  - { by: "human:local-reviewer", at: 2026-07-25T15:00:00Z }
stale_after: 2027-01-25
sources:
  - id: stripe-signatures
    resource: https://docs.stripe.com/webhooks/signature
    title: Stripe webhook signature documentation
    author: "process:stripe-docs"
    last_modified: 2026-07-02
---

# Procedure

Use the raw request body when verifying a Stripe signature.[^stripe-signatures]

[^stripe-signatures]: Stripe webhook signature documentation
```

### 4.1 Core metadata

| Field | OKF 0.2 rule | Wiki Soul convention |
|---|---|---|
| `type` | Required short string; no central taxonomy. | Choose a descriptive type. Never impose a closed vocabulary. |
| `title` | Optional and recommended. | Populate it for reading and routing. |
| `description` | Optional and recommended; one sentence. | Write a precise, information-rich retrieval description. |
| `resource` | Optional canonical URI for the asset the concept describes. | Use only for an identifiable underlying asset, not generic provenance. |
| `tags` | Optional list of short strings. | Avoid unnecessary synonyms and variants. |
| `generated` | Optional family; `by` is required within it and `at` records meaningful change time. | Required for new or meaningfully changed content. |
| `verified` | Optional mapping or list of verification events. | Write only after a real check; prefer a list for new writes. |
| `status` | Optional `draft`, `stable`, or `deprecated`; absent means `stable`. | Required explicitly. |
| `stale_after` | Optional absolute `YYYY-MM-DD`; stale on and after this date. | Add only when backed by a real freshness policy. |
| `sources` | Optional provenance list; every entry requires `resource`. | Use for material the concept derives from. |
| `usage_window` | Optional shared window for source `usage_count`. | Require a shared or entry-level window whenever a count is present. |

OKF permits producer-defined keys. Wiki Soul adds no proprietary `source`,
stored trust score, or stored trust-tier field. Its writers preserve unknown
fields when round-tripping.

File and directory names follow a Wiki Soul convention not required by OKF:
stable ASCII `kebab-case`, with content in the user's working language. One
concept represents one coherent unit of knowledge. The 200-line or 8-KiB
target is a review threshold, not an OKF limit.

## 5. Actors, verification, and trust

Identity fields use the official actor convention:

- `<producer>/<version>` for an agent or tool;
- `human:<stable-id>` for a person;
- `process:<stable-id>` for an automated process.

Wiki Soul prefers the current host's factual producer and version. When the
host exposes no version, it uses the explicit `wiki-soul/unknown` fallback
instead of guessing one. It never writes `human:unknown`; a human identifier
must be supplied or approved and must not expose an email address, credential,
or unnecessary personal data.

`generated` answers who produced the current content and when it last changed
meaningfully. `verified` answers who later or independently checked that
content against its sources, resource, or authoritative observation. A
successful generation, parse, or schema validation does not prove the
underlying knowledge.

Consumers derive these trust tiers:

| `verified` state | Derived tier |
|---|---|
| Absent | `unverified` |
| Only non-`human:` actors | `machine-confirmed` |
| At least one `human:` actor | `human-reviewed` |

Trust tiers are advisory, never access control, and are not stored. When
`generated.at` is newer than every verification event, Wiki Soul surfaces an
outdated-verification warning while retaining the formal tier derived by OKF.

## 6. Lifecycle and freshness

Wiki Soul writes one explicit status:

- `draft`: incomplete or not ready for normal consumption;
- `stable`: current and ready;
- `deprecated`: retained for links or history but no longer current.

Deprecated concepts explain the transition and link to a replacement when
bundle rules allow it. Wiki Soul records lifecycle only through OKF 0.2
`status`; it does not use a `deprecated` tag.

`stale_after` is an absolute date. `today >= stale_after` means stale. It is
not a relative TTL. Wiki Soul never invents a deadline. Missing
`stale_after` means no declared deadline, not guaranteed freshness.

## 7. Provenance and source credibility

Materials from which a concept derives live in `sources` frontmatter. Each
entry:

- requires `resource`, which may be an absolute URL, a bundle path, a
  `references/` path, or a scope descriptor;
- should have a stable unique `id`;
- must have an `id` when a body footnote cites it;
- may have `title`;
- may carry objective `author`, `usage_count`, and `last_modified` signals.

`author` uses the actor convention. `last_modified` describes the source, not
the concept. `usage_count` describes use over `usage_window`; it is a coarse
liveness and trend signal, not a score. One top-level window may frame all
entries, while one entry may override it.

Per-claim attribution uses a Markdown footnote label equal to `sources[].id`.
The footnote label is the join key; consumers do not parse its prose to locate
the source.

Wiki Soul adds these rules:

- never invent a source, credibility signal, or claim attribution;
- cite durable material that supports an external claim;
- do not require artificial sources for user preferences, internal decisions,
  or directly verified local observations;
- never copy a secret or sensitive value into memory as evidence;
- use `sources` instead of a body-level citations section or proprietary
  `source:` fields.

Lineage between OKF concepts remains ordinary Markdown linking. OKF 0.2 does
not add a separate `derived_from` graph.

See official
[provenance rules](../vendor/okf/0.2/SPEC.md#51-provenance-sources).

## 8. Attested Computation

OKF 0.2 adds `type: Attested Computation` for a sanctioned way to compute a
value. Its top-level contract can contain:

- required `runtime`;
- typed `parameters` that are the only holes an agent may fill;
- either an inline fenced computation under `# Computation` or a
  `computation` path;
- `executor.resource` and the fields required in `executor.receipt`;
- `attester.resource` pointing to deterministic, no-LLM checking code;
- the normal provenance, trust, lifecycle, and freshness families.

The computation is a standalone concept. Narrative metrics and reports link
to it through ordinary Markdown links.

Wiki Soul preserves, indexes, and structurally validates this contract. It
does not provide a trusted executor, receipt protocol, sandbox, or attester
runtime. Hooks, query, ingestion, maintenance, and normal reads never execute
referenced computation, executor, or attester content. Receipts and verdicts
are per-run artifacts, not bundle proof. Active execution is deferred to a
separate, explicitly invoked capability.

See the official
[Attested Computation contract](../vendor/okf/0.2/SPEC.md#10-attested-computations-concept).

## 9. Indexes and logs

An OKF `index.md`:

- may appear at any level of a bundle;
- enumerates concepts or subdirectories for progressive disclosure;
- uses Markdown entries with short descriptions;
- normally has no frontmatter;
- may use `okf_version` frontmatter only at the bundle root.

Wiki Soul requires `okf_version: "0.2"` in every autonomous bundle root. It
updates an index when structure or an indexed retrieval description changes,
not for every internal correction.

`log.md` remains optional. When present, date groups are newest first and every
date heading is exactly `YYYY-MM-DD`. Labels such as `Update`, `Creation`, or
`Deprecation` are prose conventions.

## 10. Link protocol

Within one bundle:

- standard Markdown links express relationships;
- links beginning with `/` are bundle-root-relative;
- `./` and `../` links use standard relative behavior;
- surrounding prose expresses relationship meaning;
- consumers tolerate broken links.

Wiki Soul prohibits global-to-global, global-to-project, and global backlinks
by convention. A topic bundle remains self-contained.

The sole exception is a project bundle's `related-bundles.md` concept:

```markdown
---
type: Reference
title: Related global knowledge bundles
description: Global knowledge bundles used by this project.
status: stable
generated: { by: "codex/5.6", at: 2026-07-25T14:30:00Z }
---

# Related bundles

- [Stripe](../../bundles/stripe/index.md) — Stripe knowledge used by this project.
```

This is a valid local Markdown link and a Wiki Soul convention, not a
standardized OKF inter-bundle relationship. It can break when the project
bundle is exported alone. Generic consumers remain able to consume the bundle
because OKF tolerates broken links.

## 11. Validation and conformance

Conformance is checked bundle by bundle, never across all of
`~/.agents/memory/`.

An official OKF 0.2 bundle is conformant when:

1. every non-reserved `.md` file contains parseable YAML frontmatter;
2. every frontmatter block contains a non-empty `type`;
3. every present `index.md` and `log.md` follows its reserved structure.

Consumers do not reject a bundle solely for a missing optional field, unknown
type, extension field, broken link, or missing index.

Wiki Soul's stricter profile additionally validates:

- required `generated` for new or meaningfully changed concepts and explicit
  valid `status`;
- actor and date forms;
- `verified` mapping/list shape;
- freshness and source credibility dates;
- source resources, unique IDs, and footnote joins;
- usage counts and windows;
- Attested Computation structure without execution;
- `okf_version: "0.2"` in every autonomous bundle root;
- encoding, retrieval metadata, local links, and forbidden content.

Normal writes validate touched concepts and affected indexes. Full maintenance
audits remain explicit.

See official
[conformance](../vendor/okf/0.2/SPEC.md#11-conformance).

## 12. Responsibility matrix

| Element | Source |
|---|---|
| UTF-8 Markdown with YAML frontmatter | OKF |
| Required, extensible `type` | OKF |
| `title`, `description`, `resource`, and `tags` | OKF |
| `sources`, footnote attribution, and credibility signals | OKF 0.2 |
| `generated`, `verified`, and derived trust tiers | OKF 0.2 |
| `status` and `stale_after` | OKF 0.2 |
| `Attested Computation` on-disk contract | OKF 0.2 |
| `index.md`, `log.md`, and Markdown links | OKF |
| `generated` on new/changed content, explicit `status`, and root `okf_version` | Wiki Soul profile |
| `~/.agents/memory/` root and catalogues | Wiki Soul |
| Global topics and Git-derived project bundles | Wiki Soul |
| Rich descriptions without `Use when:` | Wiki Soul, compatible with OKF |
| Hook routing, metadata search, and progressive reading | Wiki Soul |
| 200-line or 8-KiB review threshold | Wiki Soul |
| Project-to-global link through `related-bundles.md` | Wiki Soul exception |
| No automatic execution of Attested Computation resources | Wiki Soul security |

## 13. Known limits

- A collection of bundles in one directory is not automatically one bundle.
- Wiki Soul catalogues outside bundles are not OKF conformance units.
- The project-to-global link exception depends on the local directory layout.
- Exporting a project bundle alone can break its global-bundle links.
- OKF supplies no query, injection, security, or concurrency implementation.
- OKF 0.2 fixes the attestation interface, not execution packaging, ABI,
  sandboxing, or caching.
- Syntactic conformance and a trust tier guarantee neither truth, relevance,
  safety, nor a successful runtime attestation.

## Contract sources

- [Vendored OKF 0.2 specification](../vendor/okf/0.2/SPEC.md)
- [Snapshot provenance and maintainer update rule](../vendor/okf/0.2/README.md)
- [Pinned upstream source](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md)
- [Official upstream repository](https://github.com/GoogleCloudPlatform/knowledge-catalog)
