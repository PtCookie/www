import type { Locale } from "@/config.ts";

export interface Translation {
  "component.light": string;
  "component.dark": string;
  "component.system": string;
  "component.readTime": string;
  "component.readMore": string;
  "component.menu": string;
  "component.openMenu": string;
  "component.close": string;
  "component.skipToContent": string;
  "component.toggleTheme": string;
  "component.toggleLocale": string;
  "component.themeGroup": string;
  "component.localeGroup": string;
  "component.noComments": string;
  "component.commentCountOne": string;
  "component.commentCountOther": string;
  "component.commentMember": string;
  "component.commentName": string;
  "component.commentEmail": string;
  "component.commentBody": string;
  "component.commentSubmit": string;
  "component.commentSubmitting": string;
  "component.commentPublished": string;
  "component.commentPending": string;
  "component.commentError": string;
  "component.commentNetworkError": string;
  "component.commentsClosed": string;
  "component.pagination": string;
  "component.previous": string;
  "component.next": string;
  "component.previousPage": string;
  "component.nextPage": string;
  "component.morePages": string;
  "page.recentPosts": string;
  "page.viewAll": string;
  "page.allPosts": string;
  "page.readNext": string;
  "page.allTags": string;
  "page.noPosts": string;
  "page.noTags": string;
  "page.post": string;
  "page.posts": string;
  "page.work": string;
  "page.workDescription": string;
  "page.professionalExperience": string;
  "page.hobbyProjects": string;
  "page.underConstruction": string;
  "page.returnHome": string;
  "page.notFound": string;
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
    "component.openMenu": "메뉴 열기",
    "component.close": "닫기",
    "component.skipToContent": "본문으로 건너뛰기",
    "component.toggleTheme": "테마 전환",
    "component.toggleLocale": "언어 전환",
    "component.themeGroup": "테마 선택",
    "component.localeGroup": "언어 선택",
    "component.noComments": "아직 댓글이 없습니다",
    "component.commentCountOne": "댓글 {count}개",
    "component.commentCountOther": "댓글 {count}개",
    "component.commentMember": "사이트 회원",
    "component.commentName": "이름",
    "component.commentEmail": "이메일",
    "component.commentBody": "댓글",
    "component.commentSubmit": "댓글 남기기",
    "component.commentSubmitting": "등록 중…",
    "component.commentPublished": "댓글이 등록되었습니다.",
    "component.commentPending": "댓글은 검토 후 게시됩니다.",
    "component.commentError": "댓글을 등록하지 못했습니다.",
    "component.commentNetworkError": "네트워크 오류입니다. 다시 시도해 주세요.",
    "component.commentsClosed": "댓글 작성이 마감되었습니다.",
    "component.pagination": "페이지 이동",
    "component.previous": "이전",
    "component.next": "다음",
    "component.previousPage": "이전 페이지로 이동",
    "component.nextPage": "다음 페이지로 이동",
    "component.morePages": "더 많은 페이지",
    "page.recentPosts": "최근 게시글",
    "page.viewAll": "전체 보기",
    "page.allPosts": "모든 게시글",
    "page.readNext": "다음 읽기",
    "page.allTags": "모든 태그",
    "page.noPosts": "아직 게시글이 없습니다.",
    "page.noTags": "아직 태그가 없습니다.",
    "page.post": "게시글",
    "page.posts": "게시글",
    "page.work": "경력",
    "page.workDescription": "개발 경력과 프로젝트",
    "page.professionalExperience": "경력 사항",
    "page.hobbyProjects": "사이드 프로젝트",
    "page.underConstruction": "준비 중입니다",
    "page.returnHome": "홈으로 돌아가기",
    "page.notFound": "페이지를 찾을 수 없습니다",
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
    "component.openMenu": "Open menu",
    "component.close": "Close",
    "component.skipToContent": "Skip to content",
    "component.toggleTheme": "Toggle theme",
    "component.toggleLocale": "Toggle locale",
    "component.themeGroup": "Theme selection",
    "component.localeGroup": "Language selection",
    "component.noComments": "No comments yet",
    "component.commentCountOne": "{count} comment",
    "component.commentCountOther": "{count} comments",
    "component.commentMember": "Site member",
    "component.commentName": "Name",
    "component.commentEmail": "Email",
    "component.commentBody": "Comment",
    "component.commentSubmit": "Post comment",
    "component.commentSubmitting": "Submitting…",
    "component.commentPublished": "Your comment has been posted.",
    "component.commentPending": "Your comment will appear after review.",
    "component.commentError": "Couldn’t post your comment.",
    "component.commentNetworkError": "Network error. Please try again.",
    "component.commentsClosed": "Comments are closed.",
    "component.pagination": "Pagination",
    "component.previous": "Previous",
    "component.next": "Next",
    "component.previousPage": "Go to previous page",
    "component.nextPage": "Go to next page",
    "component.morePages": "More pages",
    "page.recentPosts": "Recent Posts",
    "page.viewAll": "View All",
    "page.allPosts": "All Posts",
    "page.readNext": "Read Next",
    "page.allTags": "All Tags",
    "page.noPosts": "No posts yet.",
    "page.noTags": "No tags yet.",
    "page.post": "post",
    "page.posts": "posts",
    "page.work": "Work",
    "page.workDescription": "Professional experience and projects",
    "page.professionalExperience": "Professional Experience",
    "page.hobbyProjects": "Hobby Projects",
    "page.underConstruction": "Under Construction",
    "page.returnHome": "Return Home",
    "page.notFound": "Page Not Found",
    "page.about": "About",
    "page.aboutDescription": "About Minsup Ju",
    "page.greeting": "Hello!",
    "page.name": "My name is Minsup Ju",
    "page.career": "I’ve been working on web development since 2019.",
    "page.techIntro": "I’ve been developing with the following…",
  },
} as const;
