// Works around an upstream Astro 7 dev-mode bug (still present in astro@7.2.3, the latest at the
// time of writing): under `astro dev`, every `client:*` island renders `component-url="/abs/fs/path"`
// instead of the `/@fs/abs/fs/path` (or root-relative `/src/...`) URL Vite actually serves.
//
// Root cause, traced against astro@7.2.2 (node_modules/astro/dist):
// - The compiler emits `client:component-path` as an absolute filesystem path
//   (core/compile/compile.js -> core/viteUtils.js's resolvePath()).
// - hydration.js turns that into `component-url` via `result.resolve(componentUrl)`, where
//   `resolve` comes from whichever dev pipeline is active.
// - The "good" pipeline (RunnablePipeline, vite-plugin-app/pipeline.js) resolves through
//   resolveIdToUrl() (core/viteUtils.js), which strips the project root or prepends `/@fs` for an
//   absolute path. That pipeline is only used when Astro's `ssr` Vite environment is a
//   RunnableDevEnvironment.
// - `@astrojs/cloudflare` replaces the `ssr` environment with `@cloudflare/vite-plugin`'s
//   `CloudflareDevEnvironment`, which does NOT extend `RunnableDevEnvironment`. Astro's own
//   `isRunnableDevEnvironment()` check then fails, so rendering falls back to the "non-runnable"
//   dev pipeline (core/app/dev/pipeline.js), whose `resolve()` is a naive passthrough:
//   `specifier.startsWith("/") ? specifier : "/@id/" + specifier` — an absolute FS path starts
//   with "/", so it comes back completely unresolved.
//
// This plugin rewrites the incoming request URL instead of patching Astro: it runs only under
// `astro dev` (`apply: "serve"`), and if a request path is an absolute filesystem path under the
// project root, it's rewritten to Vite's `/@fs/<path>` form before any other middleware sees it —
// matching what resolveIdToUrl() would have produced had the runnable pipeline been used.
// `wrangler.jsonc`'s `assets.run_worker_first` already excludes `/@fs/*` from being routed into the
// simulated Worker, so the rewritten request reaches Vite's own static/transform middleware.
//
// This alone wasn't enough to fully restore hydration: @vitejs/plugin-react's React Fast Refresh
// preamble also self-imports each component module under Vite's *root-relative* id (e.g.
// `/src/components/Navigation.tsx`, distinct from the `/@fs/...` id this plugin produces), which
// was 404ing for an unrelated reason — `/src/*` wasn't in `run_worker_first`'s exception list either.
// See that file's comment for the fix; nothing here needed to change for it.
//
// Remove this file (and its use in astro.config.mjs) once Astro fixes the non-runnable dev
// pipeline's `resolve()` to match resolveIdToUrl()'s behavior for absolute paths.

// Minimal structural types for the pieces of Vite's dev server API this plugin touches. `vite`
// itself isn't a direct dependency (it's transitive, via @astrojs/cloudflare / @astrojs/react),
// and astro doesn't re-export ViteUserConfig's Plugin type, so importing `vite` here would risk
// pulling in a second Vite instance rather than the one Astro already resolved.
interface DevServerRequest {
  url?: string;
}

interface DevServerResponse {
  statusCode: number;
  end(chunk?: string): void;
}

type Next = (err?: unknown) => void;
type Middleware = (req: DevServerRequest, res: DevServerResponse, next: Next) => void;
interface StackEntry {
  route: string;
  handle: Middleware;
}

interface Connect {
  stack?: unknown;
  use(fn: Middleware): void;
}

interface DevServer {
  middlewares: Connect;
}

interface ResolvedConfig {
  root: string;
}

interface DevIslandUrlPlugin {
  name: string;
  apply: "serve";
  configResolved(config: ResolvedConfig): void;
  configureServer(server: DevServer): void;
}

/**
 * Given a raw request URL (path + optional query string) and the Vite project root, returns the
 * `/@fs/...`-prefixed URL Vite expects for an absolute filesystem path under that root, or
 * `undefined` if the URL isn't such a path (already `/@fs/...`, root-relative, a bare Vite/dev
 * asset path, etc. — anything that should pass through unchanged).
 */
export function devIslandRequestUrl(url: string, root: string): string | undefined {
  const [pathname, search = ""] = url.split("?", 2);
  const query = search ? `?${search}` : "";

  if (!pathname.startsWith(root) || pathname.startsWith("/@fs/")) {
    return undefined;
  }

  // Guard against a root that's merely a string prefix of a sibling directory
  // (e.g. root "/a/b" shouldn't match a request for "/a/b-other/..."), and against a bare
  // request for the root path itself (component-url is always a file under it).
  if (pathname[root.length] !== "/") {
    return undefined;
  }

  return `/@fs${pathname}${query}`;
}

export function devIslandUrlPlugin(): DevIslandUrlPlugin {
  let root = "";

  return {
    name: "dev-island-url",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      const handle: Middleware = (req, _res, next) => {
        if (req.url) {
          const rewritten = devIslandRequestUrl(req.url, root);
          if (rewritten) {
            req.url = rewritten;
          }
        }
        next();
      };

      // Must run before @cloudflare/vite-plugin's own "pre" middleware, which dispatches
      // unrecognized paths (including the unrewritten absolute FS path) into the simulated
      // Worker instead of letting Vite's static/transform middleware serve them. Plugin
      // `enforce`/registration order isn't reliable here since the Cloudflare plugin also
      // manipulates the stack directly (see its `configureServer`), so this pins the position
      // explicitly rather than relying on `server.middlewares.use()`'s append-only ordering.
      const stack = server.middlewares.stack;
      if (Array.isArray(stack)) {
        (stack as StackEntry[]).unshift({ route: "", handle });
      } else {
        server.middlewares.use(handle);
      }
    },
  };
}
