# Open Knowledge Format compatibility

This document defines the boundary between the official **Open Knowledge Format (OKF) 0.1 — Draft** specification and conventions added by Wiki Soul.

It is based on [`okf/SPEC.md` on `main`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), as reviewed on July 23, 2026. OKF remains normative. If a conflict appears, Wiki Soul must change or report the incompatibility; it must not silently redefine OKF.

## 1. Compatibility principle

OKF standardizes a minimal foundation:

- a **Knowledge Bundle** is a self-contained, hierarchical collection of knowledge documents;
- a **concept** is a UTF-8 Markdown file with YAML frontmatter;
- `type` is the only required frontmatter field;
- `index.md` and `log.md` are reserved filenames;
- relationships and citations use Markdown links;
- indexes support progressive disclosure;
- consumers remain permissive toward unknown types, fields, and broken links.

OKF does not standardize:

- personal or agent memory;
- global versus project memory;
- project identification;
- hooks, context injection, or context budgets;
- rules deciding what is worth remembering;
- a closed taxonomy for `type`;
- identities or relationships across bundles;
- locking, backup, or concurrent agent writes.

Every behavior in the second list belongs to the Wiki Soul protocol.

## 2. Conformance units

Each global topic and each project is an autonomous OKF bundle.

```text
~/.agents/memory/
├── index.md                         # Lightweight Wiki Soul catalogue
├── protocol.md                      # Local Wiki Soul protocol
├── bundles/
│   ├── stripe/                      # Autonomous OKF bundle
│   │   ├── index.md
│   │   ├── log.md                   # Optional
│   │   ├── webhook-signatures.md
│   │   └── subscriptions.md
│   └── typescript/                  # Autonomous OKF bundle
│       ├── index.md
│       └── esm-gotchas.md
└── projects/
    ├── index.md                     # Complete project catalogue
    └── github-com-acme-shop/        # Autonomous OKF bundle
        ├── index.md
        ├── related-bundles.md
        └── payment-architecture.md
```

The OKF conformance units are:

- `bundles/stripe/`;
- `bundles/typescript/`;
- every other direct child of `bundles/`;
- every project directory under `projects/`.

`~/.agents/memory/` is a Wiki Soul container and catalogue. It is not presented as one Knowledge Bundle. This boundary lets topic and project bundles remain independently distributable, as intended by the official [Knowledge Bundle structure](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#3-bundle-structure).

The root `index.md` and `projects/index.md` are Wiki Soul orchestration catalogues. Their syntax deliberately resembles an OKF index, but they sit outside the autonomous bundle boundaries. `protocol.md` is installation-managed; it may use concept-style frontmatter, but its presence does not turn the memory root into a bundle.

## 3. Root catalogue and progressive disclosure

`~/.agents/memory/index.md` stays small. It contains:

- a link to the local protocol;
- one entry per global topic bundle;
- a rich, concise description for each bundle;
- one link to the project catalogue.

It does not list every project. The hook computes the current `project-id` and opens the matching project bundle index directly. `projects/index.md` is read only on demand. There is no second global catalogue under `bundles/`; the root catalogue is the single routing source.

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

Wiki Soul adds no `Use when:` field or line. Routing relies on titles, descriptions, and natural-language terms. This convention supports the progressive-disclosure purpose of [OKF index files](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#6-index-files) without introducing a proprietary index dialect.

## 4. Concept documents

Inside a bundle, every `.md` file other than `index.md` and `log.md` is an OKF concept. It must:

1. use UTF-8 encoding;
2. start with YAML frontmatter delimited by `---`;
3. contain a non-empty `type`;
4. contain a free-form Markdown body.

Example:

```markdown
---
type: Playbook
title: Stripe webhook signature validation
description: Reliable validation of Stripe webhook signatures and common failure modes.
tags: [stripe, webhooks, security]
timestamp: 2026-07-23T14:30:00Z
---

# Procedure

...

# Citations

[1] [Stripe webhook signature documentation](https://docs.stripe.com/webhooks/signature)
```

### Metadata

| Field | OKF rule | Wiki Soul convention |
|---|---|---|
| `type` | Required short string; no central taxonomy. | Choose a descriptive type. Do not impose a closed vocabulary. |
| `title` | Optional and recommended. | Populate it to improve reading and routing. |
| `description` | Optional and recommended; one sentence. | Write a precise, information-rich sentence useful for routing. |
| `resource` | Optional canonical URI for the described resource. | Use only when the concept describes an identifiable asset. Omit for abstract ideas, preferences, and procedures without a canonical asset. |
| `tags` | Optional YAML list of short strings. | No required vocabulary. Avoid unnecessary synonyms and variants. |
| `timestamp` | Optional ISO 8601 datetime of the last meaningful change. | Update after every meaningful change. Use a complete datetime with `Z` or an explicit offset. |

OKF permits producer-defined keys. Wiki Soul requires none and does not add proprietary fields such as `source:` or `status:`. Generic consumers should preserve unknown fields when round-tripping, as described by the official [frontmatter rules](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#41-frontmatter). Wiki Soul makes preservation mandatory for its own writers.

File and directory names follow a Wiki Soul convention not required by OKF:

- ASCII characters;
- `kebab-case`;
- stable names;
- content written in the user’s natural language.

One concept represents one coherent unit of knowledge. Wiki Soul targets fewer than 200 lines or 8 KiB, but this is a soft threshold. Meaning determines whether a document should be split.

## 5. Indexes and logs

### `index.md`

Under OKF, an `index.md`:

- may appear at any level of a bundle;
- enumerates concepts or subdirectories for progressive disclosure;
- uses Markdown entries with short descriptions;
- normally has no frontmatter.

The only official exception is a bundle-root `index.md`, which may declare its target version:

```yaml
---
okf_version: "0.1"
---
```

This declaration is optional. It is the only place where OKF permits frontmatter in an index, according to [Versioning](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#11-versioning).

Wiki Soul updates an index when creating, deleting, merging, splitting, renaming, or changing the description of an indexed item. An internal correction to an existing concept does not require an index rewrite.

### `log.md`

`log.md` remains optional. When present:

- date groups are ordered newest first;
- every date heading uses exactly `YYYY-MM-DD`;
- entries are free-form prose;
- labels such as `Update`, `Creation`, or `Deprecation` are conventions, not normative values.

Wiki Soul reserves logs for significant changes. It does not log every write automatically. See the official [OKF log format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#7-log-files-optional).

## 6. Link protocol

### Internal links

Within one bundle:

- concepts use standard Markdown links;
- links beginning with `/` are relative to the bundle root;
- `./` and `../` links use standard relative-path behavior;
- surrounding prose expresses the relationship;
- OKF assigns no formal type to that relationship.

Bundle-relative absolute links are preferred when a target should remain stable after moving the source document. Consumers must tolerate broken links. See [Cross-linking](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#5-cross-linking).

### General ban on inter-bundle links

Wiki Soul prohibits by convention:

- outbound links from one global bundle to another global bundle;
- links from a global bundle to a project;
- global backlinks to projects;
- dependencies required to understand a global bundle.

A topic bundle must remain self-contained.

### Sole exception: project to global bundle

A project bundle may reference global bundles that are durably relevant to it. These references live only in `related-bundles.md`.

```markdown
---
type: Reference
title: Related global knowledge bundles
description: Global knowledge bundles used by this project.
timestamp: 2026-07-23T14:30:00Z
---

# Related bundles

- [Stripe](../../bundles/stripe/index.md) — Stripe payments, subscriptions, and webhook knowledge used by this project.
- [TypeScript](../../bundles/typescript/index.md) — TypeScript and ESM knowledge used by this project.
```

The project `index.md` links to that concept:

```markdown
- [Related global bundles](related-bundles.md) — Global knowledge bundles durably relevant to this project.
```

Wiki Soul rules:

- a one-off consultation creates no relationship;
- recurring use or a dependent project concept may add the relationship automatically;
- the global bundle never creates a backlink;
- the project remains understandable when external links do not resolve;
- links target the global bundle’s root `index.md`, not a presumed-stable internal concept path.

### Limitation of this exception

OKF 0.1 defines no global bundle identifier, bundle registry, inter-bundle relationship schema, or resolution rule beyond a bundle root.

`../../bundles/stripe/index.md` is therefore:

- a valid Markdown link inside the local Wiki Soul installation;
- a Wiki Soul convention;
- non-portable when the project bundle is copied alone;
- potentially treated as broken by a generic OKF consumer;
- not interpretable as a standardized inter-bundle relationship.

This exception must never be presented as a native OKF capability. The requirement that consumers tolerate broken links keeps the bundle consumable, but it gives the link no standardized inter-bundle semantics.

## 7. Citations and provenance

When a concept makes claims derived from durable external sources, Wiki Soul follows the OKF convention:

```markdown
# Citations

[1] [Source title](https://example.com/source)
```

The section appears at the bottom of the document. Citations may use absolute URLs, paths within the bundle, or local references represented as OKF concepts.

Wiki Soul adds these rules:

- never invent a citation;
- cite durable documentation, pages, or sources supporting an external claim;
- do not require citations for user preferences, internal decisions, or directly verified local observations;
- do not replace citations with a `source:` field;
- never copy a secret or sensitive value into memory as evidence.

See the official [Citations section](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#8-citations).

## 8. Validation and conformance

Conformance is checked bundle by bundle, never across all of `~/.agents/memory/`.

An OKF 0.1 bundle is conformant when:

1. every non-reserved `.md` file contains parseable YAML frontmatter;
2. every frontmatter block contains a non-empty `type`;
3. every present `index.md` follows the OKF index structure;
4. every present `log.md` follows the OKF log structure.

A conforming consumer must not reject a bundle because of:

- a missing optional field;
- an unknown `type`;
- an additional frontmatter key;
- a broken link;
- a missing `index.md`.

Wiki Soul performs incremental validation after every write:

- check only touched files and their index links;
- reread a concept immediately before modifying it;
- validate YAML, `type`, encoding, title, description, and `timestamp`;
- check for secrets and prohibited content;
- repair immediately or restore the previous content on failure.

A full audit occurs only during an explicit memory reorganization. This validation is a Wiki Soul guarantee, not an OKF requirement.

The complete normative list appears in [Conformance](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md#9-conformance).

## 9. Responsibility matrix

| Element | Source |
|---|---|
| UTF-8 Markdown with YAML frontmatter | OKF |
| Required, extensible `type` | OKF |
| `title`, `description`, `resource`, `tags`, `timestamp` | OKF |
| `index.md`, `log.md`, citations, and Markdown links | OKF |
| Tolerance of unknown types, fields, and broken links | OKF |
| Autonomous bundles as distribution units | OKF |
| `~/.agents/memory/` root | Wiki Soul |
| Root catalogue and separate project catalogue | Wiki Soul |
| Global bundles organized by topic | Wiki Soul |
| Project bundles derived from Git identity | Wiki Soul |
| Rich descriptions without `Use when:` | Wiki Soul, compatible with OKF |
| Hook-based routing and progressive reading | Wiki Soul |
| Soft threshold of 200 lines or 8 KiB | Wiki Soul |
| Validation after every write | Wiki Soul |
| No proprietary `type` taxonomy | Wiki Soul choice aligned with OKF |
| `project → global bundle` link through `related-bundles.md` | Wiki Soul exception, not standardized by OKF |

## 10. Known limits

- OKF 0.1 remains a draft. Changes on `main` may change these conclusions.
- A collection of bundles in one directory does not automatically make that directory a bundle.
- Wiki Soul catalogues outside bundles are not OKF conformance units.
- The project-to-global link exception depends on the local directory layout.
- Exporting a project bundle alone can break its links to global bundles.
- OKF supplies no validation, migration, search, injection, security, or concurrency mechanism.
- Syntactic conformance guarantees neither truth, relevance, nor safety of remembered content.

## Official sources

- [Open Knowledge Format — SPEC.md](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
- [Raw specification on `main`](https://raw.githubusercontent.com/GoogleCloudPlatform/knowledge-catalog/main/okf/SPEC.md)
- [Official GoogleCloudPlatform/knowledge-catalog repository](https://github.com/GoogleCloudPlatform/knowledge-catalog)
