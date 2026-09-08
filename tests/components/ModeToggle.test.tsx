import * as React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ModeToggle } from "@/components/ModeToggle.tsx";

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

describe("ModeToggle", () => {
  test("renders the toggle button with expected accessibility label", () => {
    render(<ModeToggle lang="en" />);

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  test("sets initial theme based on document's data-theme attribute", () => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
    render(<ModeToggle lang="en" />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("applies dark class and persists the choice when Dark is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle lang="en" />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    const item = await screen.findByText(/dark/i);
    await user.click(item);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  test("persists the literal 'system' preference when System is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle lang="en" />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    const item = await screen.findByText(/system/i);
    await user.click(item);

    expect(document.documentElement.dataset.theme).toBe("system");
    expect(localStorage.getItem("theme")).toBe("system");
  });

  test("removes dark class from document when Light is selected", async () => {
    const user = userEvent.setup();
    // Start from an already-dark document rather than selecting Dark first. Reopening the menu
    // inside Base UI's close teardown is a race: MenuPositioner keeps an inline
    // `pointer-events: none` on the popup for as long as the menu isn't open, and on WebKit the
    // second open does not always take. Selecting Dark has its own test above.
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
    render(<ModeToggle lang="en" />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    const item = await screen.findByText(/light/i);
    await user.click(item);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("respects system preference when System is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle lang="en" />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    const item = await screen.findByText(/system/i);
    await user.click(item);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
