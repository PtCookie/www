import * as React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ModeToggle } from "@/components/ModeToggle";

const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: mockSetTheme,
  }),
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  test("renders the toggle button with expected accessibility label", () => {
    render(<ModeToggle />);

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  test("calls setTheme with 'dark' when Dark is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/dark/i));

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  test("calls setTheme with 'light' when Light is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/light/i));

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  test("calls setTheme with 'system' when System is selected", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    await user.click(screen.getByText(/system/i));

    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
