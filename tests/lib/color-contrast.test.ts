import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

// Regression cover for the dark-mode `--primary`-as-text contrast bug (ui-review-findings.md
// §1): nothing previously pinned these tokens' contrast, so a future edit to `--primary-text`
// or `--muted-foreground` could silently reintroduce it. This reads the real tokens out of
// global.css rather than hardcoding values, so it stays honest if they're retuned.

const cssPath = fileURLToPath(new URL("../../src/styles/global.css", import.meta.url));
const css = readFileSync(cssPath, "utf-8");

/** Extracts the `--token: value;` declarations from a top-level selector block (e.g. `:root`
 * or `.dark`), tolerating nested rules inside it (this file's `.dark` has one). */
function extractBlock(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(braceStart + 1, i);
    }
  }
  throw new Error(`unterminated block: ${selector}`);
}

function readOklch(block: string, token: string): [number, number, number] {
  const match = block.match(new RegExp(`--${token}:\\s*oklch\\(([^)]+)\\)`));
  if (!match) throw new Error(`token not found: --${token}`);
  const raw = match[1];
  if (raw === undefined) throw new Error(`malformed oklch() match for --${token}`);
  const [l, c, h] = raw.trim().split(/\s+/).map(Number);
  if (l === undefined || c === undefined || h === undefined) {
    throw new Error(`malformed oklch() for --${token}: ${raw}`);
  }
  return [l, c, h];
}

/** OKLCH -> linear sRGB. The linear RGB this produces is already in the right space for the
 * WCAG relative-luminance formula below — no separate gamma step needed. */
function oklchToLinearSrgb([l, c, h]: [number, number, number]): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = l_ ** 3;
  const mCubed = m_ ** 3;
  const sCubed = s_ ** 3;

  const r = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.230969929 * sCubed;
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const bLin = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  return [r, g, bLin];
}

function relativeLuminance(oklch: [number, number, number]): number {
  const [r, g, b] = oklchToLinearSrgb(oklch);
  return 0.2126 * Math.max(0, r) + 0.7152 * Math.max(0, g) + 0.0722 * Math.max(0, b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Sanity-check the harness itself before trusting anything it reports.
test("harness sanity: white on black is ~21:1", () => {
  const white: [number, number, number] = [1, 0, 0];
  const black: [number, number, number] = [0, 0, 0];
  expect(contrastRatio(white, black)).toBeCloseTo(21, 0);
});

describe.each([
  { mode: "light", selector: ":root" },
  { mode: "dark", selector: ".dark" },
])("$mode mode contrast", ({ selector }) => {
  const block = extractBlock(css, selector);
  const background = readOklch(block, "background");
  const card = readOklch(block, "card");
  const primary = readOklch(block, "primary");
  const primaryForeground = readOklch(block, "primary-foreground");
  const primaryText = readOklch(block, "primary-text");
  const mutedForeground = readOklch(block, "muted-foreground");

  test("--primary-text is readable on --background", () => {
    expect(contrastRatio(primaryText, background)).toBeGreaterThanOrEqual(4.5);
  });

  test("--primary-text is readable on --card", () => {
    expect(contrastRatio(primaryText, card)).toBeGreaterThanOrEqual(4.5);
  });

  test("--muted-foreground is readable on --background", () => {
    expect(contrastRatio(mutedForeground, background)).toBeGreaterThanOrEqual(4.5);
  });

  test("--muted-foreground is readable on --card", () => {
    expect(contrastRatio(mutedForeground, card)).toBeGreaterThanOrEqual(4.5);
  });

  test("--primary-foreground is readable on --primary (button fill)", () => {
    expect(contrastRatio(primaryForeground, primary)).toBeGreaterThanOrEqual(4.5);
  });
});
