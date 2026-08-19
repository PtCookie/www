import { afterEach, describe, expect, test, vi } from "vitest";

import type { Tag } from "@/lib/post.ts";
import { cn, formatDate, getAllTags, getTimeline, range, translate } from "@/lib/utils.ts";
import { formatPeriod, timelineEntry } from "@/i18n/timeline.ts";

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

describe("translate", () => {
  test("should return the Korean string for a given key", () => {
    expect(translate("ko", "component.light")).toBe("라이트");
  });

  test("should return the English string for a given key", () => {
    expect(translate("en", "component.light")).toBe("Light");
  });
});

describe("formatDate", () => {
  // All post frontmatter uses a +09:00 offset (see src/content/post/**), so formatDate pins its
  // rendering to Asia/Seoul — assert against a midnight-KST timestamp to guard the boundary case
  // a UTC-pinned formatter would get wrong (rolling back to the previous calendar day).
  const midnightKst = "2025-08-05T00:00:00+09:00";

  test("should format the date in Korean long form", () => {
    expect(formatDate("ko", midnightKst)).toBe("2025년 8월 5일");
  });

  test("should format the date in English long form", () => {
    expect(formatDate("en", midnightKst)).toBe("August 5, 2025");
  });
});

describe("getTimeline", () => {
  test("should return an item for every timeline entry", () => {
    const result = getTimeline("ko");

    expect(result).toHaveLength(timelineEntry.length);
  });

  test("should merge locale-independent fields with localized copy", () => {
    const result = getTimeline("en");

    for (const item of result) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.details.length).toBeGreaterThan(0);
    }
  });

  test("should keep period and technologies identical across locales", () => {
    const ko = getTimeline("ko");
    const en = getTimeline("en");

    ko.forEach((item, index) => {
      expect(item.period).toBe(en[index].period);
      expect(item.technologies).toEqual(en[index].technologies);
    });
  });

  test("should resolve ids in the same order for every locale", () => {
    const result = getTimeline("ko");

    expect(result.map((item) => item.title)).toEqual([
      "데스크톱 애플리케이션 개발",
      "풀스택 개발",
      "백엔드 개발",
      "풀스택 개발",
    ]);
  });
});

describe("formatPeriod", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("should format a closed range", () => {
    expect(formatPeriod(2019, 2021)).toBe("2019 ~ 2021");
  });

  test("should format a single year when start and end match", () => {
    expect(formatPeriod(2021, 2021)).toBe("2021");
  });

  test("should resolve 'present' to the current year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T00:00:00+09:00"));

    expect(formatPeriod(2022, "present")).toBe("2022 ~ 2026");
  });
});
