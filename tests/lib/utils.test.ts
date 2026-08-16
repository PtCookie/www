import { describe, expect, test } from "vitest";

import type { Tag } from "@/lib/schema.ts";
import { cn, getAllTags, range } from "@/lib/utils.ts";

describe("cn", () => {
  test("should concatenate multiple class strings into one", () => {
    const result = cn("class1", "class2", "class3");

    expect(result).toBe("class1 class2 class3");
  });

  test("should ignore falsy values like null, undefined, and false", () => {
    const result = cn("class1", null, undefined, false, "class2");

    expect(result).toBe("class1 class2");
  });

  test("should include numeric values as strings in the result", () => {
    const result = cn("class1", 123, "class2");

    expect(result).toBe("class1 123 class2");
  });

  test("should handle objects with truthy and falsy values", () => {
    const result = cn({ class1: true, class2: false, class3: true });

    expect(result).toBe("class1 class3");
  });

  test("should handle a mix of strings, numbers, and objects", () => {
    const result = cn("class1", { class2: true, class3: false }, 456);

    expect(result).toBe("class1 class2 456");
  });

  test("should handle array inputs and concatenate them properly", () => {
    const result = cn(["class1", "class2"], ["class3"]);

    expect(result).toBe("class1 class2 class3");
  });

  test("should handle empty inputs gracefully and return an empty string", () => {
    const result = cn();

    expect(result).toBe("");
  });
});

describe("getAllTags", () => {
  test("should return all tags with their counts (unsorted)", () => {
    const posts = [
      {
        data: {
          tags: [
            { name: "React", slug: "reactjs" },
            { name: "TypeScript", slug: "typescript" },
          ],
        },
      },
      { data: { tags: [{ name: "TypeScript", slug: "typescript" }] } },
    ];
    const result = getAllTags(posts);

    expect(result).toEqual([
      { name: "React", slug: "reactjs", count: 1 },
      { name: "TypeScript", slug: "typescript", count: 2 },
    ]);
  });

  test("should return all tags with their counts (sorted by count and name)", () => {
    const posts = [
      {
        data: {
          tags: [
            { name: "Node.js", slug: "nodejs" },
            { name: "TypeScript", slug: "typescript" },
          ],
        },
      },
      {
        data: {
          tags: [
            { name: "TypeScript", slug: "typescript" },
            { name: "React", slug: "reactjs" },
          ],
        },
      },
      { data: { tags: [{ name: "Node.js", slug: "nodejs" }] } },
    ];
    const result = getAllTags(posts, true);

    expect(result).toEqual([
      { name: "Node.js", slug: "nodejs", count: 2 },
      { name: "TypeScript", slug: "typescript", count: 2 },
      { name: "React", slug: "reactjs", count: 1 },
    ]);
  });

  test("should return an empty array when no posts are provided", () => {
    const posts: { data: { tags: Tag[] } }[] = [];
    const result = getAllTags(posts);

    expect(result).toEqual([]);
  });

  test("should handle posts with no tags", () => {
    const posts = [{ data: { tags: [] } }, { data: { tags: [{ name: "TypeScript", slug: "typescript" }] } }];
    const result = getAllTags(posts);

    expect(result).toEqual([{ name: "TypeScript", slug: "typescript", count: 1 }]);
  });
});

describe("range", () => {
  test("should return a range from 0 to n when only stop is provided", () => {
    const result = range(5);

    expect(result).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test("should return a range from start to stop when both start and stop are provided", () => {
    const result = range(2, 6);

    expect(result).toEqual([2, 3, 4, 5, 6]);
  });

  test("should return a range with custom step", () => {
    const result = range(1, 10, 3);

    expect(result).toEqual([1, 4, 7, 10]);
  });

  test("should return an single element array when start equals stop", () => {
    const result = range(3, 3);

    expect(result).toEqual([3]);
  });

  test("should return a descending range with a negative step", () => {
    const result = range(10, 3, -2);

    expect(result).toEqual([10, 8, 6, 4]);
  });

  test("should return an empty array when step makes the range invalid", () => {
    const result = range(3, 10, -1);

    expect(result).toEqual([]);
  });
});
