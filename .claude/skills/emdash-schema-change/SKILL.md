---
name: emdash-schema-change
description: Change EmDash CMS schema (collections, fields, taxonomies) safely and keep .emdash/seed.json in sync for fresh installs
disable-model-invocation: true
---

# EmDash schema change

Use this whenever a collection, field, or taxonomy on the live site needs to change. Read
`AGENTS.md`'s EmDash gotchas section first if anything here is ambiguous — it has the full
incident history (taxonomy locale duplication bug, seed-apply-once behavior).

## The one rule that causes incidents

**Never hand-edit `.emdash/seed.json` expecting it to change a live database.** It is only
applied to an empty database on first bootstrap (`emdash seed` defaults to `--on-conflict skip`),
so editing it and redeploying does nothing to an already-bootstrapped local or production DB.
`seed.json` is a record of the schema for *future* fresh installs, not a source of truth you push
to a running site.

The real workflow is: **change the live instance first, then export the new state back into
`seed.json`.**

## Step 1 — change the live instance

Do this against local dev first (`pnpm dev`, `http://localhost:4321`), verify in
`/_emdash/admin`, then repeat against production once confirmed.

Authenticate once per target instance, then omit `-t` on later commands:
```bash
pnpm exec emdash login -u http://localhost:4321
```

**Collections / fields** — via `/_emdash/admin` or:
```bash
pnpm exec emdash schema create <slug> --label="<Label>" [--label-singular=...] [--description=...] -u http://localhost:4321
pnpm exec emdash schema add-field <collection> <field> --type=<string|text|number|integer|boolean|datetime|image|reference|portableText|json> [--label=...] [--required] -u http://localhost:4321
```

**Taxonomy terms** — via `/_emdash/admin` or:
```bash
pnpm exec emdash taxonomy add-term <taxonomy> --name="<Label>" [--slug=...] [--parent=<id>] -u http://localhost:4321
```

**Taxonomy definitions — do NOT create a new one.** `tag` and `category` are core EmDash
built-ins seeded unconditionally by a database migration before `seed.json` is ever applied. Since
the `(name, locale)` uniqueness migration, a taxonomy *definition* is keyed by name **and**
locale — creating a second definition for `tag` in another locale (via a `seed.json` block or an
equivalent API call) creates a **duplicate** definition row that the admin manifest lists with no
dedupe, producing a second "Tags" entry in the sidebar. This exact bug already happened once here
(see AGENTS.md); the fix was deleting the duplicate row via raw SQL. If you need an English
translation of an existing term, add it as a translation of the ko term (admin UI's translation
link, or a term carrying `locale` + `translationOf` if going through seed data directly) — never a
second per-locale taxonomy block.

## Step 2 — update PostData by hand if collection fields changed

`src/lib/post.ts`'s `PostData` interface is a hand-maintained mirror of the `posts` collection
shape (the generated `.emdash/types.ts` is gitignored and unavailable at review time). If you
added/removed/renamed a field on `posts`, update `PostData` and `toPostView()` to match, and check
whether `PostCard`/`PostList` or the post detail route need the new field surfaced.

## Step 3 — export the new schema into `.emdash/seed.json`

`export-seed`'s `--database` flag wants a real sqlite file path, not the D1 binding name, and its
default (`./data.db`) doesn't exist in this project — the real local D1 file is one of the two
larger sqlite files (not `metadata.sqlite`) under:
```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite
```
Find the current one and export **without** `--with-content` — this project's actual blog
content lives only in D1/R2, not in `seed.json`, and dumping it in would bloat the file and leak
draft posts into git:
```bash
pnpm exec emdash export-seed --database .wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite --cwd . > /tmp/exported-seed.json
```
Diff `/tmp/exported-seed.json` against `.emdash/seed.json` by hand and merge in only the schema
change you intended — the exporter reflects the *entire* current DB state, including anything
else that has drifted, and a naive overwrite can silently reintroduce or hide unrelated changes
(e.g. re-splitting the taxonomy block per locale, which must stay collapsed — see Step 1).

Optionally sanity-check the merged result parses and validates before committing:
```bash
pnpm exec emdash seed .emdash/seed.json --database <a-scratch-copy-of-the-sqlite-file> --validate
```

## Step 4 — commit

Commit the updated `.emdash/seed.json` alongside any `PostData`/`post.ts` changes from Step 2, in
the same change as the schema change itself. Do not run `emdash types` and commit its output —
`.emdash/types.ts` is gitignored by design (see AGENTS.md).
