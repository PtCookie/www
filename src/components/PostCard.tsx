import * as React from "react";

import { badgeVariants } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card.tsx";
import type { Post } from "@/lib/schema.ts";
import { cn, formatDate, translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  post: Post;
  lang?: Locale;
  disableImage?: boolean;
  // Cards are reused inline within a page that already has its own <h1>/<h2> — callers pass the
  // level that keeps this card's title one step below its surrounding section heading.
  headingLevel?: "h2" | "h3";
  children?: React.ReactNode;
}

export function PostCard({
  post,
  lang = config.defaultLocale,
  disableImage = false,
  headingLevel: Heading = "h2",
  children,
}: Props) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className={cn("-mt-6 block overflow-hidden p-0", !disableImage && "h-48")}>
        {!disableImage &&
          (children || (
            <img
              src={post.coverImage.url.src}
              alt={post.title}
              width={post.coverImage.url.width}
              height={post.coverImage.url.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full overflow-hidden rounded-t-xl object-cover"
            />
          ))}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Heading className="font-sans text-xl font-bold text-pretty break-words sm:text-2xl">{post.title}</Heading>
          <div className="text-muted-foreground flex justify-between font-sans text-xs tabular-nums sm:text-sm">
            <p>
              <time dateTime={post.publishedAt}>{formatDate(lang, post.publishedAt)}</time>
            </p>
            <p>
              {post.readTimeInMinutes}
              {translate(lang, "component.readTime")}
            </p>
          </div>
          <p className="line-clamp-3 font-serif text-sm sm:text-base">{post.brief}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-start justify-between gap-4">
        <a
          href={lang ? `/${lang}/posts/${post.slug}` : `/posts/${post.slug}`}
          className="text-primary shrink-0 font-sans text-xs font-medium hover:underline sm:text-sm"
        >
          {translate(lang, "component.readMore")}
        </a>
        <div className="flex min-w-0 flex-wrap justify-end gap-2">
          {post.tags.map((tag) => (
            <a
              key={tag.slug}
              href={lang ? `/${lang}/tags/${tag.slug}` : `/tags/${tag.slug}`}
              data-testid="badge"
              className={cn(badgeVariants({ variant: "secondary" }), "font-mono")}
            >
              #{tag.name}
            </a>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
