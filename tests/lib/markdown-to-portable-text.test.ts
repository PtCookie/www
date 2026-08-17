import { describe, expect, test } from "vitest";

import { markdownToPortableText } from "../../scripts/lib/markdown-to-portable-text.mjs";

// Regression fixtures for cases where EmDash's own line-by-line markdownToPortableText
// (emdash/client) breaks on this repo's post bodies — see the module comment in
// scripts/lib/markdown-to-portable-text.mjs for the full rationale.

function textOf(block: { children: { text: string }[] }) {
  return block.children.map((span) => span.text).join("");
}

describe("markdownToPortableText", () => {
  test("merges a paragraph wrapped across multiple source lines into one block", () => {
    const blocks = markdownToPortableText("first line\nsecond line\nthird line");

    expect(blocks).toHaveLength(1);
    expect(blocks[0]._type).toBe("block");
    expect(blocks[0].style).toBe("normal");
    expect(textOf(blocks[0])).toBe("first line second line third line");
  });

  test("keeps a code fence inside a blockquote as a separate code block, not quoted text", () => {
    const blocks = markdownToPortableText("> quoted text\n>\n> ```typescript\n> const x = 1;\n> ```");

    const quoted = blocks.filter((b) => b.style === "blockquote");
    expect(quoted).toHaveLength(1);
    expect(textOf(quoted[0])).toBe("quoted text");

    const code = blocks.find((b) => b._type === "code");
    expect(code).toMatchObject({ language: "typescript", code: "const x = 1;" });
    // The fence markers must not leak into the quoted paragraph's text.
    expect(textOf(quoted[0])).not.toContain("```");
  });

  test("recognizes *asterisk* emphasis, not just _underscore_ emphasis", () => {
    const blocks = markdownToPortableText("this is *emphasized* text");

    const emphasized = blocks[0].children.find((span) => span.marks.includes("em"));
    expect(emphasized).toMatchObject({ text: "emphasized" });
  });

  test("preserves a code fence's language attribute", () => {
    const blocks = markdownToPortableText("```sh\necho hello\n```");

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ _type: "code", language: "sh", code: "echo hello" });
  });

  test("handles a fence with no language", () => {
    const blocks = markdownToPortableText("```\nplain text\n```");

    expect(blocks[0]).toMatchObject({ _type: "code", language: undefined, code: "plain text" });
  });

  test("resolves marks nested inside a link label, e.g. [*text*](url)", () => {
    const blocks = markdownToPortableText("[*Hooks API Reference*](https://example.com)");

    const span = blocks[0].children[0];
    expect(span.text).toBe("Hooks API Reference");
    expect(span.marks).toContain("em");
    const linkMark = span.marks.find((m: string) => m !== "em");
    const markDef = blocks[0].markDefs.find((d) => d._key === linkMark);
    expect(markDef).toMatchObject({ _type: "link", href: "https://example.com" });
  });

  test("converts a nested unordered list, tracking level per nesting depth", () => {
    const blocks = markdownToPortableText("- top\n  - nested\n- top again");

    expect(blocks.map((b) => ({ text: textOf(b), level: b.level }))).toEqual([
      { text: "top", level: 1 },
      { text: "nested", level: 2 },
      { text: "top again", level: 1 },
    ]);
    expect(blocks.every((b) => b.listItem === "bullet")).toBe(true);
  });

  test("converts an ordered list inside a blockquote, keeping both blockquote style and list attrs", () => {
    const blocks = markdownToPortableText("> 1. first step\n> 2. second step");

    expect(blocks).toHaveLength(2);
    for (const block of blocks) {
      expect(block.style).toBe("blockquote");
      expect(block.listItem).toBe("number");
      expect(block.level).toBe(1);
    }
    expect(textOf(blocks[0])).toBe("first step");
    expect(textOf(blocks[1])).toBe("second step");
  });

  test("headings map to h1-h6 styles", () => {
    const blocks = markdownToPortableText("## Section Title");

    expect(blocks[0].style).toBe("h2");
    expect(textOf(blocks[0])).toBe("Section Title");
  });

  test("produces stable, unique block and span keys across a document", () => {
    const blocks = markdownToPortableText("# Title\n\nSome **bold** text.\n\n- item one\n- item two");

    const keys = new Set<string>();
    for (const block of blocks) {
      keys.add(block._key);
      for (const span of block.children ?? []) keys.add(span._key);
      for (const def of block.markDefs ?? []) keys.add(def._key);
    }
    const totalKeys =
      blocks.length + blocks.reduce((n, b) => n + (b.children?.length ?? 0) + (b.markDefs?.length ?? 0), 0);
    expect(keys.size).toBe(totalKeys);
  });
});
