# Vendored anti-slop Oxlint plugin

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), commit
`c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b` (2026-09-10, "Merge pull request
#36 from K-Mistele/contrib/effect-tag-match-rules").

Verified: the upstream tree at `skills/install-anti-slop/assets/anti-slop` is
byte-identical to the pristine skill assets this copy was installed from. The
only differences between the assets and this directory are the import
rewrites listed below.

Installed entry points:

- `index.ts` — generic plugin, registered as `anti-slop` in the root
  `vite.config.ts`.
- `effect/index.ts` — opt-in Effect plugin, registered as `anti-slop-effect`
  because `apps/server-v2` declares `effect` directly.

## Local adaptations

- Rewrite every `@oxlint/plugins` import specifier to
  `vite-plus/lint/plugins` (34 double-quoted imports plus one single-quoted
  import in `vendor/eslint-stylistic/padding-line-between-statements.ts`).
  Vite+ bundles Oxlint and its docs direct plugins to import the authoring API
  from `vite-plus/lint/plugins` instead of adding `oxlint` or `@oxlint/plugins`
  as direct dependencies; the vendored tree is ignored by lint and format, so
  no other edits were made.
- No `oxlint` or `@oxlint/plugins` dependency was added. The active Oxlint is
  the one bundled with `vite-plus` (1.85.0) and the import resolves through the
  root `vite-plus` dependency.

No other content differs from upstream.

## Known limitations

- The Effect rules cover relative project imports. Imports through package
  aliases are not detected.
- `no-array-filter-map` and `no-reduce-accumulator-copy` analyze a constrained
  AST/scope surface; see the install skill notes for what they deliberately do
  not infer. Pair `no-reduce-accumulator-copy` with `oxc/no-accumulating-spread`,
  which is enabled alongside it.

## Updating

Fetch an explicit upstream revision, diff
`skills/install-anti-slop/assets/anti-slop` against this tree, port relevant
changes, re-apply the import rewrite above, and update this record.
