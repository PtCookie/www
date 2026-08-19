export interface MenuEntry {
  name: string;
  link: string;
}

export type Locale = "ko" | "en";

// SSR routes (post/tag pages) resolve `lang` from the URL at request time instead of via
// getStaticPaths params, so they need a runtime check instead of the compile-time guarantee
// getStaticPaths gave them.
export function isLocale(value: string | undefined): value is Locale {
  return value === "ko" || value === "en";
}

export interface Config {
  title: string;
  description: string;
  copyrightFrom: number;
  menuEntry: MenuEntry[];
  linkEntry: MenuEntry[];
  locales: Locale[];
  defaultLocale: Locale;
}

export const config: Config = {
  title: "PtCookie.Net",
  description: "Personal blog of PtCookie.Net",
  copyrightFrom: 2021,
  menuEntry: [
    { name: "Home", link: "/" },
    { name: "Work", link: "/work" },
    { name: "About", link: "/about" },
    { name: "Posts", link: "/posts" },
  ],
  linkEntry: [{ name: "Git", link: "https://git.ptcookie.net/" }],
  locales: ["ko", "en"],
  defaultLocale: "ko",
};
