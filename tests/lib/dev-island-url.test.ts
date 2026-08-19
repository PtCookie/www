import { describe, expect, test } from "vitest";
import { devIslandRequestUrl } from "@/lib/dev-island-url.ts";

const root = "/Users/cookie/Workspaces/Projects/www";

describe("devIslandRequestUrl", () => {
  test("prefixes an absolute path under the project root with /@fs", () => {
    expect(devIslandRequestUrl(`${root}/src/components/Navigation.tsx`, root)).toBe(
      `/@fs${root}/src/components/Navigation.tsx`,
    );
  });

  test("preserves a query string on the rewritten URL", () => {
    expect(devIslandRequestUrl(`${root}/src/components/Navigation.tsx?t=1755600000000`, root)).toBe(
      `/@fs${root}/src/components/Navigation.tsx?t=1755600000000`,
    );
  });

  test("leaves an already-/@fs/-prefixed URL unchanged", () => {
    expect(devIslandRequestUrl(`/@fs${root}/src/components/Navigation.tsx`, root)).toBeUndefined();
  });

  test("leaves a root-relative URL unchanged", () => {
    expect(devIslandRequestUrl("/src/components/Navigation.tsx", root)).toBeUndefined();
  });

  test("leaves other Vite dev asset URLs unchanged", () => {
    expect(devIslandRequestUrl("/@vite/client", root)).toBeUndefined();
  });

  test("leaves a normal app route unchanged", () => {
    expect(devIslandRequestUrl("/ko/posts", root)).toBeUndefined();
  });

  test("does not match a sibling directory that merely shares the root as a string prefix", () => {
    expect(devIslandRequestUrl(`${root}-other/src/components/Navigation.tsx`, root)).toBeUndefined();
  });

  test("does not match a bare request for the root path itself", () => {
    expect(devIslandRequestUrl(root, root)).toBeUndefined();
  });
});
