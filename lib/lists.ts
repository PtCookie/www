export interface MenuEntry {
  name: string;
  link: string;
}

export interface TimelineItem {
  period: string;
  title: string;
  description: string;
  technologies: string[];
  details?: string[];
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

export const timelineData: TimelineItem[] = [
  {
    period: `2022 ~ ${new Date().getFullYear()}`,
    title: "Desktop Application Development",
    description: "Desktop application development using Electron",
    technologies: ["Electron", "React.js", "Windows", "Ubuntu"],
    details: [
      "Control hardware like relay through serial port",
      "Print receipt & labels, Communicate with DLL",
      "WebSocket / UDP communication with other devices",
    ],
  },
  {
    period: `2022 ~ ${new Date().getFullYear()}`,
    title: "Fullstack Development",
    description: "Fullstack development using React.js / Node.js",
    technologies: ["Next.js", "Ant Design", "GraphQL", "Express.js", "MongoDB"],
    details: [
      "Antd & Next.js website",
      "Express.js & GraphQL API Server",
      "Modeling with Mongoose.js & MongoDB aggregation",
    ],
  },
  {
    period: "2021",
    title: "Backend Development",
    description: "Backend development with Python Flask",
    technologies: ["Flask", "Python"],
    details: ["API server for internal services"],
  },
  {
    period: "2019 ~ 2021",
    title: "Fullstack Development",
    description: "Fullstack development with PHP Laravel",
    technologies: ["React.js", "Laravel"],
    details: ["React.js app for customers", "API server for devices"],
  },
];
