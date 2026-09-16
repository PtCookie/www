import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import type { PostView } from "@/lib/post.ts";
import { PostCard } from "@/components/PostCard.tsx";

const mockPost: PostView = {
  publishedAt: new Date(2025, 2, 22).toISOString(),
  title: "Sample Post",
  subtitle: "Description of the post",
  brief: "This is a brief summary of the post.",
  slug: "sample-post",
  readTimeInMinutes: 10,
  tags: [
    { name: "Tag One", slug: "tag1" },
    { name: "Tag Two", slug: "tag2" },
  ],
  coverImage: {
    image: { id: "media_1", src: "/cover-image.jpg", width: 100, height: 100 },
    attribution: null,
    photographer: null,
  },
};

describe("PostCard", () => {
  test("renders correctly with all content", () => {
    render(<PostCard post={mockPost} lang="en" />);

    // The cover is decorative (alt=""), which drops it out of the accessibility tree — query the
    // presentation role rather than "img", and never by alt text.
    const img = screen.getByRole("presentation");
    const header = screen.getByTestId("card-header");

    expect(img).toBeInTheDocument();
    expect(header).toContainElement(img);
    expect(header).toHaveClass("overflow-hidden");
    expect(img).toHaveAttribute("alt", "");
    expect(screen.queryByAltText("Sample Post")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /sample post/i })).toBeInTheDocument();
    expect(screen.getByText("March 22, 2025")).toBeInTheDocument();
    expect(screen.getByText("10 min read")).toBeInTheDocument();
    expect(screen.getByText(/this is a brief summary of the post/i)).toBeInTheDocument();
    expect(screen.getByText("#Tag One")).toBeInTheDocument();
    expect(screen.getByText("#Tag Two")).toBeInTheDocument();
  });

  test("makes the title the post link and leaves no second link to the same post", () => {
    render(<PostCard post={mockPost} lang="en" />);

    expect(screen.getByRole("link", { name: /sample post/i })).toHaveAttribute("href", "/en/posts/sample-post");
    // "Read more" is a plain <span> covered by the title's stretched link, so it must not show up
    // as a duplicate link of its own.
    expect(screen.queryByRole("link", { name: /read more/i })).not.toBeInTheDocument();
    expect(screen.getByText("Read more")).toBeInTheDocument();
  });

  test("does not render an image when disableImage is true", () => {
    render(<PostCard post={mockPost} disableImage />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Sample Post")).not.toBeInTheDocument();
  });

  test("renders the correct number of tags", () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getAllByTestId("badge").length).toBe(mockPost.tags.length);
  });

  test("renders the tags as a list so their count is announced", () => {
    render(<PostCard post={mockPost} lang="en" />);

    const items = screen.getAllByRole("listitem");

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(items.length).toBe(mockPost.tags.length);
    items.forEach((item) => expect(item).toContainElement(item.querySelector("[data-testid='badge']")));
  });
});
