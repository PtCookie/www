import * as React from "react";

import { badgeVariants } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card.tsx";
import type { PostView } from "@/lib/post.ts";
import { cn, formatDate, tagLinkClass, translate } from "@/lib/utils.ts";
import { config, type Locale } from "@/config.ts";

interface Props {
  post: PostView;
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
  const href = lang ? `/${lang}/posts/${post.slug}` : `/posts/${post.slug}`;

  return (
    // `relative` anchors the title's stretched link (`after:inset-0`), which makes the whole card
    // one target. Anything else that must stay clickable inside the card has to sit above that
    // overlay — see the tag list below.
    <Card className="relative w-full max-w-2xl">
      <CardHeader className={cn("-mt-6 block overflow-hidden p-0", !disableImage && "h-48")}>
        {!disableImage &&
          (children ||
            (post.coverImage.image && (
              <img
                src={post.coverImage.image.src}
                alt=""
                width={post.coverImage.image.width}
                height={post.coverImage.image.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full overflow-hidden rounded-t-xl object-cover"
              />
            )))}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Heading className="font-sans text-xl font-bold text-pretty break-words sm:text-2xl">
            <a href={href} className="after:absolute after:inset-0 hover:underline">
              {post.title}
            </a>
          </Heading>
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
        {/* A span, not a link: the title's stretched link already covers the whole card, and a
            second anchor to the same post would add a duplicate tab stop plus a vague "Read more"
            link name to the accessibility tree. Clicks still land on the overlay above it. */}
        <span className="text-primary shrink-0 font-sans text-xs font-medium group-hover/card:underline sm:text-sm">
          {translate(lang, "component.readMore")}
        </span>
        {/* `relative z-10` lifts the tags above the title's stretched-link overlay; `role="list"`
            restores the list semantics Tailwind's `list-style: none` preflight strips. */}
        <ul role="list" className="relative z-10 flex min-w-0 flex-wrap justify-end gap-2">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <a
                href={lang ? `/${lang}/tags/${tag.slug}` : `/tags/${tag.slug}`}
                data-testid="badge"
                className={cn(badgeVariants({ variant: "secondary" }), tagLinkClass)}
              >
                #{tag.name}
              </a>
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  );
}
