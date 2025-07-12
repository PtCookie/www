export interface MenuEntry {
  name: string;
  link: string;
}

export const menuEntry: MenuEntry[] = [
  { name: "Home", link: "/" },
  { name: "Work", link: "/work" },
  { name: "About", link: "/about" },
];

export const linkEntry: MenuEntry[] = [
  { name: "Blog", link: "https://devlog.ptcookie.net/" },
  { name: "Git", link: "https://git.ptcookie.net/" },
];
