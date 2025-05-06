export interface MenuEntry {
  name: string;
  link: string;
}

export interface Config {
  title: string;
  description: string;
  author: string;
  copyrightFrom: number;
  menuEntry: Array<MenuEntry>;
}

export const config: Config = {
  title: "DevLog",
  description: "A DevLog of PtCookie",
  author: "PtCookie",
  copyrightFrom: 2021,
  menuEntry: [
    { name: "Home", link: "/" },
    { name: "Posts", link: "/posts" },
    { name: "Tags", link: "/tags" },
  ],
};
