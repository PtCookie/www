import React from "react";
import { format } from "date-fns";

import type { Post } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { badgeVariants } from "@/components/ui/badge.tsx";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card.tsx";

interface Props {
  post: Post;
  disableImage?: boolean;
  children?: React.ReactNode;
}

export function PostCard({ post, disableImage = false, children }: Props) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className={cn("-mt-6 p-0", !disableImage && "h-48")}>
        {!disableImage &&
          (children || (
            <img
              src={post.coverImage.url}
              alt={post.title}
              className="h-full w-full overflow-hidden rounded-t-xl object-cover"
            />
          ))}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h2 className="font-sans text-xl font-bold sm:text-2xl">{post.title}</h2>
          <div className="text-muted-foreground flex justify-between font-sans text-xs sm:text-sm">
            <p>{format(post.publishedAt, "yyyy-MM-dd")}</p>
            <p>{post.readTimeInMinutes}min read</p>
          </div>
          <p className="line-clamp-3 font-serif text-sm sm:text-base">{post.brief}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-start justify-between">
        <a
          href={`/posts/${post.slug}`}
          className="text-primary font-sans text-xs font-medium hover:underline sm:text-sm"
        >
          Read more
        </a>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <a
              key={tag.slug}
              href={`/tags/${tag.slug}`}
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
