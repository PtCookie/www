#!/usr/bin/env node
// Migrate src/content/post/{ko,en}/*.md + src/assets/covers/{ko,en}/* into EmDash (D1 content,
// R2 media). See /Users/cookie/.claude/plans/emdash-vast-diffie.md (or AGENTS.md's EmDash
// gotchas) for why this exists instead of just pointing content at emdash content create.
//
// Idempotent: before creating a post it checks whether (collection, slug, locale) already
// exists and skips it, so re-running against a partially-migrated or already-migrated instance
// (local or production) is safe. Pass --force to overwrite existing entries instead.
//
// Usage:
//   node scripts/migrate-content.mjs [--url <base>] [--dry-run] [--force]
//
// --url      EmDash instance URL (default: EMDASH_URL env var, then http://localhost:4321)
// --dry-run  Convert and log what would happen; no network writes
// --force    Update existing entries instead of skipping them
//
// Auth resolution, matching the emdash CLI (node_modules/emdash/src/cli/client-factory.ts):
// EMDASH_TOKEN env var, else credentials stored by `emdash login --url <base>` in
// ~/.config/emdash/auth.json (keyed by origin; refreshed automatically on expiry via the
// stored refresh token), else dev-bypass for localhost URLs. For a remote instance, run
// `emdash login --url <base>` first — it opens a browser for OAuth device-flow approval.

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import { EmDashApiError, EmDashClient } from "emdash/client";

import { markdownToPortableText } from "./lib/markdown-to-portable-text.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POST_ROOT = path.join(ROOT, "src/content/post");
const LOCALES = ["ko", "en"];
const COLLECTION = "posts";
const TAXONOMY = "tag";
const CREDENTIALS_PATH = path.join(homedir(), ".config", "emdash", "auth.json");

function parseArgs(argv) {
  const args = { url: process.env.EMDASH_URL || "http://localhost:4321", dryRun: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--url") args.url = argv[++i];
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node scripts/migrate-content.mjs [--url <base>] [--dry-run] [--force]");
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  return args;
}

async function readStoredCredential(baseUrl) {
  let store;
  try {
    store = JSON.parse(await readFile(CREDENTIALS_PATH, "utf-8"));
  } catch {
    return null;
  }
  const cred = store[new URL(baseUrl).origin];
  return cred && "accessToken" in cred ? cred : null;
}

async function persistRefreshedToken(baseUrl, cred, accessToken, expiresIn) {
  let store;
  try {
    store = JSON.parse(await readFile(CREDENTIALS_PATH, "utf-8"));
  } catch {
    store = {};
  }
  const key = new URL(baseUrl).origin;
  store[key] = { ...cred, accessToken, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() };
  await writeFile(CREDENTIALS_PATH, JSON.stringify(store, null, "\t"), { mode: 0o600 });
}

async function createClient(baseUrl) {
  const envToken = process.env.EMDASH_TOKEN;
  if (envToken) return new EmDashClient({ baseUrl, token: envToken });

  const cred = await readStoredCredential(baseUrl);
  if (cred) {
    return new EmDashClient({
      baseUrl,
      token: cred.accessToken,
      refreshToken: cred.refreshToken,
      onTokenRefresh: (accessToken, expiresIn) => persistRefreshedToken(baseUrl, cred, accessToken, expiresIn),
    });
  }

  const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
  if (!isLocal) {
    throw new Error(`No credentials for ${baseUrl}. Run: emdash login --url ${baseUrl}`);
  }
  return new EmDashClient({ baseUrl, devBypass: true });
}

/** Read and frontmatter-parse every ko post, paired with its en counterpart. Throws if a
 * ko post has no en counterpart (the corpus is 1:1 today; a silent partial migration would
 * be worse than failing loudly). */
async function loadPostPairs() {
  const koDir = path.join(POST_ROOT, "ko");
  const files = (await readdir(koDir)).filter((f) => f.endsWith(".md")).sort();

  const pairs = [];
  for (const filename of files) {
    const perLocale = {};
    for (const locale of LOCALES) {
      const filePath = path.join(POST_ROOT, locale, filename);
      const raw = await readFile(filePath, "utf-8");
      const { data: frontmatter, content: body } = matter(raw);
      perLocale[locale] = { filePath, frontmatter, body };
    }
    pairs.push({ filename, ...perLocale });
  }
  return pairs;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Upload a cover image, deduplicating within this run by content hash. The server also
 * dedupes by hash (identical ko/en covers — 12 of 13 pairs are byte-identical — collapse to
 * one media item there too), but caching here avoids a redundant upload request. */
function makeCoverUploader(client) {
  const cache = new Map(); // sha256 -> MediaItem
  return async function uploadCover(mdFilePath, frontmatter, altText) {
    const imagePath = path.resolve(path.dirname(mdFilePath), frontmatter.coverImage.url);
    const buffer = await readFile(imagePath);
    const hash = sha256(buffer);

    const cached = cache.get(hash);
    if (cached) return cached;

    const filename = path.basename(imagePath);
    const media = await client.mediaUpload(buffer, filename, { alt: altText });
    cache.set(hash, media);
    return media;
  };
}

function buildData(frontmatter, body, coverMediaId) {
  return {
    title: frontmatter.title,
    subtitle: frontmatter.subtitle,
    excerpt: frontmatter.brief,
    content: markdownToPortableText(body),
    cover_image: coverMediaId,
    cover_attribution: frontmatter.coverImage.attribution,
    cover_photographer: frontmatter.coverImage.photographer,
  };
}

async function findExisting(client, slug, locale) {
  try {
    return await client.get(COLLECTION, slug, { locale });
  } catch (error) {
    if (error instanceof EmDashApiError && error.status === 404) return null;
    throw error;
  }
}

async function preflight(client) {
  const collection = await client.collection(COLLECTION).catch(() => null);
  if (!collection) {
    throw new Error(`Collection "${COLLECTION}" not found. Has .emdash/seed.json been applied to this instance yet?`);
  }

  for (const locale of LOCALES) {
    const terms = await client.terms(TAXONOMY, { locale }).catch(() => ({ items: [] }));
    if (terms.items.length === 0) {
      throw new Error(
        `Taxonomy "${TAXONOMY}" has no ${locale} terms. Has .emdash/seed.json been applied to this instance yet?`,
      );
    }
  }
}

async function migratePost(client, uploadCover, pair, { dryRun, force }, summary) {
  const ko = pair.ko;
  const tagSlugs = ko.frontmatter.tags.map((t) => t.slug);
  const slug = ko.frontmatter.slug;

  console.log(`\n${pair.filename}`);

  let koId = null;
  for (const locale of LOCALES) {
    const entry = pair[locale];
    const existing = await findExisting(client, slug, locale);

    if (existing && !force) {
      console.log(`  [skip] ${locale}: already exists (${existing.id})`);
      summary.skipped++;
      if (locale === "ko") koId = existing.id;
      continue;
    }

    if (dryRun) {
      const blocks = markdownToPortableText(entry.body);
      console.log(
        `  [dry-run] ${locale}: would ${existing ? "update" : "create"} ` +
          `(${blocks.length} PT blocks, ${entry.frontmatter.tags.length} tags, ` +
          `cover=${path.basename(entry.frontmatter.coverImage.url)})`,
      );
      continue;
    }

    const cover = await uploadCover(entry.filePath, entry.frontmatter, entry.frontmatter.title);
    summary.mediaSeen.add(cover.id);
    const data = buildData(entry.frontmatter, entry.body, cover.id);

    let item;
    if (existing && force) {
      item = await client.update(COLLECTION, existing.id, { data, _rev: existing._rev });
      console.log(`  [update] ${locale}: ${item.id}`);
    } else if (locale === "ko") {
      item = await client.create(COLLECTION, {
        data,
        slug,
        locale,
        publishedAt: entry.frontmatter.publishedAt,
        taxonomies: { [TAXONOMY]: tagSlugs },
      });
      koId = item.id;
      console.log(`  [create] ko: ${item.id}`);
    } else {
      item = await client.create(COLLECTION, {
        data,
        slug,
        locale,
        translationOf: koId,
        publishedAt: entry.frontmatter.publishedAt,
        // No `taxonomies` here: translationOf makes the server copy the ko source entry's
        // content_taxonomies rows verbatim (copyEntryTerms), which is enough. Term reads
        // (getAllTermsForEntries) re-join the pivot's taxonomy_id through `translation_group`
        // filtered by the *entry's own* locale, so the copied ko-term-row pivot still resolves
        // to the en-locale term at read time — passing taxonomies again here would just repeat
        // the same slug -> translation_group resolution setTermsForEntry already normalized to,
        // a same-group no-op diff (verified against the local DB: 0 rows changed either way).
      });
      console.log(`  [create] en: ${item.id} (translationOf ${koId})`);
    }

    await client.publish(COLLECTION, item.id);
    summary.created++;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`Target: ${args.url}${args.dryRun ? " (dry run)" : ""}`);

  const client = await createClient(args.url);
  await preflight(client);

  const pairs = (await loadPostPairs()).map((p) => ({
    filename: p.filename,
    ko: p.ko,
    en: p.en,
  }));
  console.log(`Found ${pairs.length} post pairs (${pairs.length * 2} entries to reconcile).`);

  const uploadCover = makeCoverUploader(client);
  const summary = { created: 0, skipped: 0, mediaSeen: new Set() };

  for (const pair of pairs) {
    await migratePost(client, uploadCover, pair, args, summary);
  }

  console.log(`\nDone. created=${summary.created} skipped=${summary.skipped} media_uploaded=${summary.mediaSeen.size}`);
}

main().catch((error) => {
  console.error("\nMigration failed:", error);
  process.exit(1);
});
