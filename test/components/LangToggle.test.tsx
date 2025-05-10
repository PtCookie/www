import * as React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { navigate } from "astro:transitions/client";

import { LangToggle } from "@/components/LangToggle.tsx";

vi.mock("astro:transitions/client", () => ({
  navigate: vi.fn(),
}));

describe("LangToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly", () => {
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    expect(screen.getByRole("button", { name: "Toggle Locale" })).toBeInTheDocument();
  });

  test("should navigate to Korean version when Korean language is selected", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle Locale" }));
    await user.click(screen.getByText("한글"));

    expect(navigate).toHaveBeenCalledWith("/ko/page");
  });

  test("should navigate to English version when English language is selected", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="ko" currentUrl="/ko/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle Locale" }));
    await user.click(screen.getByText("English"));

    expect(navigate).toHaveBeenCalledWith("/en/page");
  });

  test("should not navigate when selected language matches current language", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle Locale" }));
    await user.click(screen.getByText("English"));

    expect(navigate).not.toHaveBeenCalled();
  });
});
