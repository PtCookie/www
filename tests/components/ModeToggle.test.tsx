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
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  }),
);

describe("ModeToggle", () => {
  test("renders the toggle button with expected accessibility label", () => {
    render(<ModeToggle />);

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  test("sets initial theme based on document's dark mode class", () => {
    document.documentElement.classList.add("dark");
    render(<ModeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("applies dark class to document when Dark is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle lang="en" />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/dark/i));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("removes dark class from document when Light is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle lang="en" />);

    // Ensure dark mode is applied first
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/dark/i));

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Switch to light
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/light/i));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("respects system preference when System is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle lang="en" />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/system/i));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
