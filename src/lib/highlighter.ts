import { createHighlighterCore, type HighlighterCore, type ShikiTransformer } from "@shikijs/core";
import { createOnigurumaEngine } from "@shikijs/engine-oniguruma";
// Fine-grained per-language imports instead of the top-level `shiki` package's `createHighlighter`:
// that convenience API bundles every language it *might* dynamically load, which pulled in over
// 800 chunks (~4.6 MB gzip) for a Worker whose posts only ever use eight of them — see
// AGENTS.md. `shiki/onig.wasm` (the actual regex engine binary) still comes from the top-level
// `shiki` package, which doesn't expose its own wasm subpath.
import c from "@shikijs/langs/c";
import cpp from "@shikijs/langs/cpp";
import javascript from "@shikijs/langs/javascript";
import powershell from "@shikijs/langs/powershell";
import python from "@shikijs/langs/python";
import shellscript from "@shikijs/langs/shellscript";
import typescript from "@shikijs/langs/typescript";
import catppuccinLatte from "@shikijs/themes/catppuccin-latte";
import catppuccinMacchiato from "@shikijs/themes/catppuccin-macchiato";

import { shikiThemes } from "@/lib/shiki.ts";

// The corpus's markdown fences use "sh" as the shell language id (see
// scripts/lib/markdown-to-portable-text.mjs's git history), but the grammar itself registers
// under "shellscript" — the full `shiki` bundle resolves this via its own alias table, which
// fine-grained mode doesn't include, so it's spelled out by hand instead. "bash" is included as
// a courtesy for any future post; it's the same grammar.
const LANG_ALIAS: Record<string, string> = { sh: "shellscript", bash: "shellscript" };

let highlighterPromise: Promise<HighlighterCore> | undefined;

// A module-scope singleton persists across requests within a Worker isolate, same as Astro's own
// highlighter cache (@astrojs/internal-helpers/shiki).
function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    themes: [catppuccinMacchiato, catppuccinLatte],
    langs: [c, cpp, javascript, powershell, python, shellscript, typescript],
    engine: createOnigurumaEngine(import("shiki/onig.wasm")),
  });
  return highlighterPromise;
}

function toClassString(value: unknown): string {
  return Array.isArray(value) ? value.join(" ") : typeof value === "string" ? value : "";
}

/** Rename Shiki's default "shiki" class to "astro-code" and add the wrap/data-language output
 * astro.config.mjs's markdown pipeline produces, so src/styles/global.css's `.astro-code`
 * dark-mode override (and the data-language attribute) work identically for Portable Text code
 * blocks as they did for the old build-time markdown code fences. */
function astroCodeTransformer(lang: string): ShikiTransformer {
  return {
    pre(node) {
      node.properties.class = toClassString(node.properties.class).replace(/shiki/g, "astro-code");
      node.properties["data-language"] = lang;
      node.properties.style = `${toClassString(node.properties.style)}; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;`;
    },
  };
}

/** Highlight one Portable Text code block to HTML. Falls back to plaintext for an unknown or
 * missing language (the fine-grained language set above is deliberately closed — this project's
 * corpus is fixed — rather than lazily loading arbitrary languages on demand). */
export async function highlightCode(code: string, lang: string | undefined): Promise<string> {
  const highlighter = await getHighlighter();
  const requestedLang = lang ? (LANG_ALIAS[lang] ?? lang) : "plaintext";
  const resolvedLang =
    requestedLang === "plaintext" || highlighter.getLoadedLanguages().includes(requestedLang)
      ? requestedLang
      : "plaintext";

  return highlighter.codeToHtml(code, {
    lang: resolvedLang,
    themes: shikiThemes,
    transformers: [astroCodeTransformer(resolvedLang)],
  });
}
