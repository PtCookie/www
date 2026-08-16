import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import type { Post } from "@/lib/schema.ts";
import { PostCard } from "@/components/PostCard.tsx";

const mockPost: Post = {
  id: "1",
  author: {
    name: "author",
    profilePicture: "/profile-image.jpg",
  },
  publishedAt: new Date(2025, 2, 22).toISOString(),
  title: "Sample Post",
  subtitle: "Description of the post",
  brief: "This is a brief summary of the post.",
  slug: "sample-post",
  readTimeInMinutes: 10,
  content: { markdown: "# Sample Post" },
  tags: [
    { name: "Tag One", slug: "tag1" },
    { name: "Tag Two", slug: "tag2" },
  ],
  coverImage: {
    url: "/cover-image.jpg",
    attribution: null,
    photographer: null,
  },
  locale: "en",
};

describe("PostCard", () => {
  test("renders correctly with all content", () => {
    render(<PostCard post={mockPost} lang="en" />);

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByAltText("Sample Post")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /sample post/i })).toBeInTheDocument();
    expect(screen.getByText("2025-03-22")).toBeInTheDocument();
    expect(screen.getByText("10min read")).toBeInTheDocument();
    expect(screen.getByText(/this is a brief summary of the post/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read more/i })).toHaveAttribute("href", "/en/posts/sample-post");
    expect(screen.getByText("#Tag One")).toBeInTheDocument();
    expect(screen.getByText("#Tag Two")).toBeInTheDocument();
  });

  test("does not render an image when disableImage is true", () => {
    render(<PostCard post={mockPost} disableImage />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Sample Post")).not.toBeInTheDocument();
  });

  test("renders the correct number of tags", () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getAllByTestId("badge").length).toBe(mockPost.tags.length);
  });
});
