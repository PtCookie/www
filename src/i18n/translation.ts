import type { Locale } from "@/config.ts";

export interface Translation {
  "component.light": string;
  "component.dark": string;
  "component.system": string;
  "component.readTime": string;
  "component.readMore": string;
  "page.viewAll": string;
  "page.allPosts": string;
  "page.readNext": string;
  "page.allTags": string;
  "page.posts": string;
}

export const translation: { [key in Locale]: Translation } = {
  ko: {
    "component.light": "라이트",
    "component.dark": "다크",
    "component.system": "시스템",
    "component.readTime": "분 소요",
    "component.readMore": "더 읽기",
    "page.viewAll": "전체 보기",
    "page.allPosts": "모든 게시글",
    "page.readNext": "다음 읽기",
    "page.allTags": "모든 태그",
    "page.posts": "게시글",
  },
  en: {
    "component.light": "Light",
    "component.dark": "Dark",
    "component.system": "System",
    "component.readTime": "min read",
    "component.readMore": "Read more",
    "page.viewAll": "View All",
    "page.allPosts": "All Posts",
    "page.readNext": "Read Next",
    "page.allTags": "All Tags",
    "page.posts": "posts",
  },
} as const;
