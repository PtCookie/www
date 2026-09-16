import * as React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LangToggle } from "@/components/LangToggle.tsx";

describe("LangToggle", () => {
  test("renders correctly", () => {
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    expect(screen.getByRole("button", { name: "Toggle locale" })).toBeInTheDocument();
  });

  // Real <a href> elements, not onClick + navigate(): Cmd/Ctrl-click, middle-click and "copy
  // link address" all need a working href, so the assertion here is on the link itself rather
  // than on a mocked navigate() call.
  test("links to the Korean version of the current page", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle locale" }));
    const item = await screen.findByText("한글");

    expect(item.closest("a")).toHaveAttribute("href", "/ko/page");
  });

  test("links to the English version of the current page", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="ko" currentUrl="/ko/page" />);

    await user.click(screen.getByRole("button", { name: "언어 전환" }));
    const item = await screen.findByText("English");

    expect(item.closest("a")).toHaveAttribute("href", "/en/page");
  });

  test("marks the current locale with aria-current", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle locale" }));
    const current = await screen.findByText("English");
    const other = await screen.findByText("한글");

    expect(current.closest("a")).toHaveAttribute("aria-current", "true");
    expect(other.closest("a")).not.toHaveAttribute("aria-current");
  });
});
