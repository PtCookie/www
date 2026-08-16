import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Navigation } from "@/components/Navigation.tsx";

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

  test("should not render a Link trigger when linkEntry is empty or omitted", () => {
    render(<Navigation menuEntry={[]} />);

    expect(screen.queryByText("Link")).not.toBeInTheDocument();
  });

  test("should render a Link trigger exposing external entries when linkEntry is provided", async () => {
    const user = userEvent.setup();
    const linkEntry = [{ name: "Git", link: "https://git.ptcookie.net/" }];
    render(<Navigation menuEntry={[]} linkEntry={linkEntry} />);

    expect(screen.getByText("Link")).toBeInTheDocument();

    await user.click(screen.getByText("Link"));

    const gitLink = await screen.findByText("Git");
    expect(gitLink.closest("a")).toHaveAttribute("href", "https://git.ptcookie.net/");
  });

  test("should open external links in a new tab", async () => {
    const user = userEvent.setup();
    const linkEntry = [{ name: "Git", link: "https://git.ptcookie.net/" }];
    render(<Navigation menuEntry={[]} linkEntry={linkEntry} />);

    await user.click(screen.getByText("Link"));

    const gitLink = await screen.findByText("Git");
    expect(gitLink.closest("a")).toHaveAttribute("target", "_blank");
    expect(gitLink.closest("a")).toHaveAttribute("rel", "noreferrer");
  });
});
