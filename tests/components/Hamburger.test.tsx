import * as React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { navigate } from "astro:transitions/client";

import { Hamburger } from "@/components/Hamburger.tsx";

vi.mock("astro:transitions/client", () => ({
  navigate: vi.fn(),
}));

vi.stubGlobal(
  "matchMedia",
  vi.fn().mockImplementation((query) => {
    return {
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }),
);

const menuEntry = [
  { name: "Home", link: "/en" },
  { name: "Work", link: "/en/work" },
  { name: "About", link: "/en/about" },
  { name: "Blog", link: "/en/posts" },
];
const linkEntry = [{ name: "Git", link: "https://git.ptcookie.net/" }];

describe("Hamburger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
    document.body.style.removeProperty("pointer-events");
  });

  test("renders the trigger with expected accessibility label", () => {
    render(<Hamburger lang="en" menuEntry={menuEntry} currentUrl="/en/work" />);

    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
  });

  test("shows every localized menu entry and the external link entry when opened", async () => {
    const user = userEvent.setup();
    render(<Hamburger lang="en" menuEntry={menuEntry} linkEntry={linkEntry} currentUrl="/en/work" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    for (const item of menuEntry) {
      expect(screen.getByText(item.name).closest("a")).toHaveAttribute("href", item.link);
    }
    expect(screen.getByText("Git").closest("a")).toHaveAttribute("href", "https://git.ptcookie.net/");
  });

  test("applies dark class to document when Dark is selected", async () => {
    const user = userEvent.setup();
    render(<Hamburger lang="en" menuEntry={menuEntry} currentUrl="/en/work" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByText(/dark/i));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("removes dark class from document when Light is selected", async () => {
    const user = userEvent.setup();
    render(<Hamburger lang="en" menuEntry={menuEntry} currentUrl="/en/work" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByText(/dark/i));
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByText(/light/i));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("marks the active theme button with aria-current, including System", async () => {
    const user = userEvent.setup();
    render(<Hamburger lang="en" menuEntry={menuEntry} currentUrl="/en/work" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    expect(screen.getByText(/system/i).closest("button")).toHaveAttribute("aria-current", "true");

    await user.click(screen.getByText(/dark/i));
    expect(screen.getByText(/dark/i).closest("button")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText(/system/i).closest("button")).toHaveAttribute("aria-current", "false");

    await user.click(screen.getByText(/system/i));
    expect(screen.getByText(/system/i).closest("button")).toHaveAttribute("aria-current", "true");
  });

  test("navigates to the English version when English is selected", async () => {
    const user = userEvent.setup();
    render(<Hamburger lang="ko" menuEntry={menuEntry} currentUrl="/ko/work" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByText("English"));

    expect(navigate).toHaveBeenCalledWith("/en/work");
  });

  test("does not leave the document inert once the sheet finishes closing", async () => {
    // In production, Astro's ClientRouter intercepts same-origin anchor clicks via a
    // *bubble*-phase document listener, so it only sees the click after SheetClose's own
    // handler on the <a> itself has already run and started closing the sheet. Emulate that
    // ordering (bubble, not capture) so the test stays on this document instead of the real
    // browser navigating the test iframe away, without also swallowing SheetClose's click
    // (Radix's composeEventHandlers skips a handler once `event.defaultPrevented` is set).
    //
    // Note: this only exercises Radix's own close cleanup, which runs normally here because
    // React stays mounted throughout the test. The failure mode this component guards against
    // — a ClientRouter DOM swap interrupting that cleanup mid-flight, covered by the
    // `astro:after-swap` listener in Header.astro — can't be reproduced in a component-level
    // test; it needs an e2e check against the real router.
    const preventNavigation = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        event.preventDefault();
      }
    };
    document.addEventListener("click", preventNavigation);

    const user = userEvent.setup();
    render(<Hamburger lang="en" menuEntry={menuEntry} currentUrl="/en/work" />);

    await user.click(screen.getByRole("button", { name: /open menu/i }));
    await user.click(screen.getByText("Home"));

    await waitFor(() => expect(document.body.style.pointerEvents).not.toBe("none"));

    document.removeEventListener("click", preventNavigation);
  });
});
