import { navigate } from "astro:transitions/client";

import type { Locale } from "@/config.ts";

// Kept out of `utils.ts`: `tests/lib/utils.test.ts` runs in the node-environment `unit`
// vitest project, and importing `astro:transitions/client` there would drag in a virtual
// module that project can't resolve. Locale switching is covered behaviourally instead,
// by the LangToggle/Hamburger component tests.
export async function switchLocale(lang: Locale, target: Locale, currentUrl: string): Promise<void> {
  if (lang !== target) {
    await navigate(currentUrl.replace(lang, target));
  }
}
