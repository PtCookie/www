// Markdown -> Portable Text converter for the content migration script.
//
// EmDash ships its own `markdownToPortableText` (emdash/client), but it's a line-by-line
// parser: a paragraph wrapped across multiple source lines becomes one PT block per line,
// a code fence inside a blockquote leaks its fence markers into the quoted text, and
// `*emphasis*` isn't recognized (only `_emphasis_`). This repo's post bodies rely on all
// three (see AGENTS.md), so this migration uses a real markdown AST (mdast-util-from-markdown,
// CommonMark only — the corpus has no tables/strikethrough/task-lists, so no GFM extension
// is wired in) and walks it into Portable Text blocks directly.
//
// Supported node types match what actually appears in src/content/post/**: paragraphs,
// headings, code fences (with language), blockquotes, ordered/unordered lists (including
// lists nested inside blockquotes), thematic breaks, and the inline marks strong/emphasis/
// inlineCode/strikethrough/links (including marks nested inside a link label).
//
// Portable Text is flat (no nesting), so:
// - A blockquote's block-level children are re-emitted as separate blocks with
//   style: "blockquote". PortableText.astro's groupBlockquoteRuns() merges consecutive
//   blockquote-styled blocks back into a single <blockquote> at render time.
// - A code fence found *inside* a blockquote can't carry the blockquote style (code blocks
//   have no `style` field) and is emitted as a plain code block immediately after the quoted
//   text — the one place this repo's content loses its visual nesting. Confirmed to affect
//   exactly one post (promise-and-asynchronous-operation).

import { fromMarkdown } from "mdast-util-from-markdown";

let keyCounter = 0;

/** Reset the deterministic key counter. Call before converting each document. */
export function resetKeyCounter() {
  keyCounter = 0;
}

function nextKey() {
  return `k${(keyCounter++).toString(36)}`;
}

function makeSpan(text, marks) {
  return { _type: "span", _key: nextKey(), text, marks };
}

/**
 * Convert mdast inline children (text, strong, emphasis, delete, inlineCode, link, ...)
 * into Portable Text spans + markDefs. `marks` accumulates enclosing mark names/keys as we
 * recurse, so e.g. a link wrapping an emphasis wrapping text ends up as one span carrying
 * both the link markDef key and "em".
 */
function inlineToSpans(nodes, marks = []) {
  const spans = [];
  const markDefs = [];

  for (const node of nodes ?? []) {
    switch (node.type) {
      case "text":
        // A paragraph wrapped across multiple source lines (no blank line between them) is one
        // mdast text node whose value keeps the literal "\n"s from the source. Collapse them to
        // spaces so the block renders as continuous prose instead of embedding raw newlines.
        spans.push(makeSpan(node.value.replace(/\n/g, " "), marks));
        break;
      case "inlineCode":
        spans.push(makeSpan(node.value, [...marks, "code"]));
        break;
      case "strong": {
        const inner = inlineToSpans(node.children, [...marks, "strong"]);
        spans.push(...inner.spans);
        markDefs.push(...inner.markDefs);
        break;
      }
      case "emphasis": {
        const inner = inlineToSpans(node.children, [...marks, "em"]);
        spans.push(...inner.spans);
        markDefs.push(...inner.markDefs);
        break;
      }
      case "delete": {
        const inner = inlineToSpans(node.children, [...marks, "strike-through"]);
        spans.push(...inner.spans);
        markDefs.push(...inner.markDefs);
        break;
      }
      case "link": {
        const key = nextKey();
        markDefs.push({ _key: key, _type: "link", href: node.url });
        const inner = inlineToSpans(node.children, [...marks, key]);
        spans.push(...inner.spans);
        markDefs.push(...inner.markDefs);
        break;
      }
      case "break":
        // Hard line break. Not present in this corpus (checked: no trailing double-space or
        // backslash line breaks outside code fences), but handle it rather than drop text.
        spans.push(makeSpan("\n", marks));
        break;
      case "image":
        // Not present in this corpus (checked: no "![" anywhere in post bodies). Fall back to
        // alt text so a future post with an inline image doesn't silently lose content.
        spans.push(makeSpan(node.alt ?? "", marks));
        break;
      default: {
        const inner = inlineToSpans(node.children, marks);
        if (inner.spans.length > 0) {
          spans.push(...inner.spans);
          markDefs.push(...inner.markDefs);
        } else if (typeof node.value === "string") {
          spans.push(makeSpan(node.value, marks));
        }
      }
    }
  }

  return { spans, markDefs };
}

function makeTextBlock(children, style, extra = {}) {
  const { spans, markDefs } = inlineToSpans(children);
  return { _type: "block", _key: nextKey(), style, markDefs, children: spans, ...extra };
}

function makeCodeBlock(node) {
  return { _type: "code", _key: nextKey(), language: node.lang || undefined, code: node.value };
}

/**
 * Convert one mdast block-level node into zero or more Portable Text blocks.
 * `forceStyle` overrides normal/heading styles with "blockquote" for content quoted via `>`.
 */
function convertBlockNode(node, level, forceStyle) {
  switch (node.type) {
    case "paragraph":
      return [makeTextBlock(node.children, forceStyle ?? "normal")];

    case "heading":
      return [makeTextBlock(node.children, forceStyle ?? `h${node.depth}`)];

    case "code":
      // Portable Text code blocks have no `style` field, so a fence quoted via `>` can't
      // carry blockquote styling — see the module-level note above.
      return [makeCodeBlock(node)];

    case "thematicBreak":
      return [{ _type: "break", _key: nextKey() }];

    case "blockquote":
      return node.children.flatMap((child) => convertBlockNode(child, 1, "blockquote"));

    case "list":
      return node.children.flatMap((item) =>
        item.children.flatMap((child) =>
          child.type === "list"
            ? convertBlockNode(child, level + 1, forceStyle)
            : child.type === "paragraph"
              ? [
                  makeTextBlock(child.children, forceStyle ?? "normal", {
                    listItem: node.ordered ? "number" : "bullet",
                    level,
                  }),
                ]
              : convertBlockNode(child, level, forceStyle),
        ),
      );

    default:
      // Unhandled node type (shouldn't happen for this corpus — see the coverage checks
      // recorded in AGENTS.md). Surface it as plain text rather than silently dropping content.
      if (Array.isArray(node.children)) {
        return [makeTextBlock(node.children, forceStyle ?? "normal")];
      }
      return [];
  }
}

/**
 * Convert a markdown document body (no frontmatter) into a Portable Text block array.
 * Resets the deterministic key counter first, so keys are stable per document.
 */
export function markdownToPortableText(markdown) {
  resetKeyCounter();
  const tree = fromMarkdown(markdown);
  return tree.children.flatMap((node) => convertBlockNode(node, 1, null));
}
