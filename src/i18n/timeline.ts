import type { Locale } from "@/config.ts";

// Structured, list-shaped localized content lives in a sibling `src/i18n/*.ts` module keyed
// by a stable id, resolved via `getTimeline()` in `src/lib/utils.ts` — `Translation` itself
// can only hold flat strings, not arrays.
export type TimelineId = "desktopApp" | "fullstackNode" | "backendPython" | "fullstackPhp";

export interface TimelineEntry {
  id: TimelineId;
  periodStart: number;
  periodEnd: number | "present";
  technologies: string[];
}

export interface TimelineCopy {
  title: string;
  description: string;
  details: string[];
}

export interface TimelineItem extends Omit<TimelineEntry, "id" | "periodStart" | "periodEnd">, TimelineCopy {
  period: string;
}

// Resolves an entry's periodStart/periodEnd into a display string. Deliberately not called at
// module load time (see timelineEntry below) — must run per-render via getTimeline() instead.
export function formatPeriod(start: number, end: number | "present"): string {
  const resolvedEnd = end === "present" ? new Date().getFullYear() : end;
  return start === resolvedEnd ? `${start}` : `${start} ~ ${resolvedEnd}`;
}

// Period and technologies are proper nouns / dates — not locale-dependent.
// periodEnd is a raw start/end year pair, not a formatted string: under the Cloudflare Workers
// adapter, `new Date()` calls made at module top-level (like this array literal) run in global
// scope, where Workers clamps the clock to the Unix epoch. formatPeriod() must be called from a
// per-render context (getTimeline()) instead, the same way Footer.astro's copyright year is.
export const timelineEntry: TimelineEntry[] = [
  {
    id: "desktopApp",
    periodStart: 2022,
    periodEnd: "present",
    technologies: ["Electron", "React.js", "Windows", "Ubuntu"],
  },
  {
    id: "fullstackNode",
    periodStart: 2022,
    periodEnd: "present",
    technologies: ["Next.js", "Ant Design", "GraphQL", "Express.js", "MongoDB"],
  },
  {
    id: "backendPython",
    periodStart: 2021,
    periodEnd: 2021,
    technologies: ["Flask", "Python"],
  },
  {
    id: "fullstackPhp",
    periodStart: 2019,
    periodEnd: 2021,
    technologies: ["React.js", "Laravel"],
  },
];

export const timelineCopy: Record<Locale, Record<TimelineId, TimelineCopy>> = {
  ko: {
    desktopApp: {
      title: "데스크톱 애플리케이션 개발",
      description: "Electron을 활용한 데스크톱 애플리케이션 개발",
      details: [
        "시리얼 포트를 통한 릴레이 등 하드웨어 제어",
        "영수증·라벨 출력 및 DLL 연동",
        "WebSocket / UDP를 이용한 기기 간 통신",
      ],
    },
    fullstackNode: {
      title: "풀스택 개발",
      description: "React.js / Node.js를 활용한 풀스택 개발",
      details: [
        "Ant Design과 Next.js 기반 웹사이트",
        "Express.js와 GraphQL API 서버",
        "Mongoose.js 모델링과 MongoDB Aggregation 활용",
      ],
    },
    backendPython: {
      title: "백엔드 개발",
      description: "Python Flask를 활용한 백엔드 개발",
      details: ["사내 서비스용 API 서버"],
    },
    fullstackPhp: {
      title: "풀스택 개발",
      description: "PHP Laravel을 활용한 풀스택 개발",
      details: ["고객용 React.js 애플리케이션", "장비 연동 API 서버"],
    },
  },
  en: {
    desktopApp: {
      title: "Desktop Application Development",
      description: "Desktop application development using Electron",
      details: [
        "Control hardware like relay through serial port",
        "Print receipt & labels, Communicate with DLL",
        "WebSocket / UDP communication with other devices",
      ],
    },
    fullstackNode: {
      title: "Fullstack Development",
      description: "Fullstack development using React.js / Node.js",
      details: [
        "Antd & Next.js website",
        "Express.js & GraphQL API Server",
        "Modeling with Mongoose.js & MongoDB aggregation",
      ],
    },
    backendPython: {
      title: "Backend Development",
      description: "Backend development with Python Flask",
      details: ["API server for internal services"],
    },
    fullstackPhp: {
      title: "Fullstack Development",
      description: "Fullstack development with PHP Laravel",
      details: ["React.js app for customers", "API server for devices"],
    },
  },
};
