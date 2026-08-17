import type { Locale } from "@/config.ts";

export interface Translation {
  "component.light": string;
  "component.dark": string;
  "component.system": string;
  "component.readTime": string;
  "component.readMore": string;
  "component.menu": string;
  "component.skipToContent": string;
  "component.toggleTheme": string;
  "component.toggleLocale": string;
  "component.themeGroup": string;
  "component.localeGroup": string;
  "page.recentPosts": string;
  "page.viewAll": string;
  "page.allPosts": string;
  "page.readNext": string;
  "page.allTags": string;
  "page.posts": string;
  "page.work": string;
  "page.workDescription": string;
  "page.professionalExperience": string;
  "page.hobbyProjects": string;
  "page.underConstruction": string;
  "page.returnHome": string;
  "page.about": string;
  "page.aboutDescription": string;
  "page.greeting": string;
  "page.name": string;
  "page.career": string;
  "page.techIntro": string;
}

export const translation: Record<Locale, Translation> = {
  ko: {
    "component.light": "라이트",
    "component.dark": "다크",
    "component.system": "시스템",
    "component.readTime": "분 소요",
    "component.readMore": "더 읽기",
    "component.menu": "메뉴",
    "component.skipToContent": "본문으로 건너뛰기",
    "component.toggleTheme": "테마 전환",
    "component.toggleLocale": "언어 전환",
    "component.themeGroup": "테마 선택",
    "component.localeGroup": "언어 선택",
    "page.recentPosts": "최근 게시글",
    "page.viewAll": "전체 보기",
    "page.allPosts": "모든 게시글",
    "page.readNext": "다음 읽기",
    "page.allTags": "모든 태그",
    "page.posts": "게시글",
    "page.work": "경력",
    "page.workDescription": "개발 경력과 프로젝트",
    "page.professionalExperience": "경력 사항",
    "page.hobbyProjects": "사이드 프로젝트",
    "page.underConstruction": "준비 중입니다",
    "page.returnHome": "홈으로 돌아가기",
    "page.about": "소개",
    "page.aboutDescription": "자기소개",
    "page.greeting": "안녕하세요!",
    "page.name": "주민섭입니다",
    "page.career": "2019년부터 웹 개발을 하고 있습니다.",
    "page.techIntro": "다음 기술들을 사용하고 있습니다",
  },
  en: {
    "component.light": "Light",
    "component.dark": "Dark",
    "component.system": "System",
    "component.readTime": " min read",
    "component.readMore": "Read more",
    "component.menu": "Menu",
    "component.skipToContent": "Skip to content",
    "component.toggleTheme": "Toggle theme",
    "component.toggleLocale": "Toggle Locale",
    "component.themeGroup": "Theme selection",
    "component.localeGroup": "Language selection",
    "page.recentPosts": "Recent Posts",
    "page.viewAll": "View All",
    "page.allPosts": "All Posts",
    "page.readNext": "Read Next",
    "page.allTags": "All Tags",
    "page.posts": "posts",
    "page.work": "Work",
    "page.workDescription": "Professional experience and projects",
    "page.professionalExperience": "Professional Experience",
    "page.hobbyProjects": "Hobby Projects",
    "page.underConstruction": "Under Construction",
    "page.returnHome": "Return Home",
    "page.about": "About",
    "page.aboutDescription": "About Minsup Ju",
    "page.greeting": "Hello!",
    "page.name": "My name is Minsup Ju",
    "page.career": "I’ve been working on web development since 2019.",
    "page.techIntro": "I’ve been developing with the following…",
  },
} as const;
