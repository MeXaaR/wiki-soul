# Vendored OKF 0.2

Wiki Soul targets the immutable OKF 0.2 snapshot in [`SPEC.md`](SPEC.md).
Installation, audit, repair, querying, ingestion, and maintenance use this
local document. They do not fetch or compare the mutable upstream `main`
branch.

## Provenance

- Upstream repository:
  <https://github.com/GoogleCloudPlatform/knowledge-catalog>
- Upstream path: `okf/SPEC.md`
- Snapshot commit:
  [`3fcbb9f828c2f23d109c855ee403c3a4c81f3a96`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/3fcbb9f828c2f23d109c855ee403c3a4c81f3a96/okf/SPEC.md)
- Copied on: 2026-07-25
- SHA-256:
  `5a3311d270bebb16d558010e75064f5b75323f284992641732b1c8097511f948`
- License: Apache License 2.0, copied in [`../LICENSE.md`](../LICENSE.md)

The snapshot is byte-identical to the upstream file at the pinned commit.

## Maintainer update rule

Do not update this snapshot during user installation. A maintainer adopts a
new OKF version deliberately by reviewing the upstream change, updating Wiki
Soul's complete contract and tests, replacing this snapshot, recording the new
commit and checksum, then publishing a new framework version.
