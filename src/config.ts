export interface MenuEntry {
  name: string;
  link: string;
}

export type Locale = "ko" | "en";

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
    { name: "Blog", link: "/posts" },
  ],
  linkEntry: [{ name: "Git", link: "https://git.ptcookie.net/" }],
  locales: ["ko", "en"],
  defaultLocale: "ko",
};
