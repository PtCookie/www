// PostToolUse hook (Bash): the shadcn CLI emits `@/lib/utils` without the file extension, but
// this project's `@/` alias imports require one (see AGENTS.md conventions). Runs on every Bash
// call but only acts when the command looks like a shadcn `add`, and only rewrites files that
// still have the extensionless import — so it's a no-op the rest of the time.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf-8"));
const command = input.tool_input?.command ?? "";

if (!/\bshadcn(@[\w.-]+)?\s+add\b/.test(command)) {
  process.exit(0);
}

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const uiDir = join(root, "src/components/ui");
const fixed = [];

let entries;
try {
  entries = readdirSync(uiDir, { withFileTypes: true });
} catch {
  process.exit(0);
}

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
  const path = join(uiDir, entry.name);
  const content = readFileSync(path, "utf-8");
  const patched = content.replace(/(["'])@\/lib\/utils\1/g, "$1@/lib/utils.ts$1");
  if (patched !== content) {
    writeFileSync(path, patched);
    fixed.push(entry.name);
  }
}

if (fixed.length > 0) {
  console.error(`fix-shadcn-import: added .ts extension to @/lib/utils import in ${fixed.join(", ")}`);
}
