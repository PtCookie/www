import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Navigation } from "@/components/ui/Navigation.tsx";

describe("Navigation", () => {
  test("should render the navigation menu with provided menu entries", async () => {
    const menuEntry = [
      { name: "Home", link: "/" },
      { name: "Posts", link: "/posts" },
      { name: "Tags", link: "/tags" },
    ];

    render(<Navigation menuEntry={menuEntry} />);

    for (const item of menuEntry) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.name).closest("a")).toHaveAttribute("href", item.link);
    }
  });

  test("should render nothing if no menu entries are provided", () => {
    render(<Navigation menuEntry={[]} />);
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
