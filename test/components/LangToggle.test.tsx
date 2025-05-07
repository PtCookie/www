import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LangToggle } from "@/components/LangToggle.tsx";

describe("LangToggle", () => {
  beforeEach(() => {
    vi.stubGlobal("location", () => ({
      href: "",
    }));
    window.location.href = "";
  });

  test("renders correctly", () => {
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    expect(screen.getByRole("button", { name: "Toggle Locale" })).toBeInTheDocument();
  });

  test("changes href when clicking on Korean option", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle Locale" }));
    await user.click(screen.getByText("한글"));

    expect(window.location.href).toBe("/ko/page");
  });

  test("changes href when clicking on English option", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="ko" currentUrl="/ko/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle Locale" }));
    await user.click(screen.getByText("English"));

    expect(window.location.href).toBe("/en/page");
  });

  test("does not change href if the selected language is the current language", async () => {
    const user = userEvent.setup();
    render(<LangToggle lang="en" currentUrl="/en/page" />);

    await user.click(screen.getByRole("button", { name: "Toggle Locale" }));
    await user.click(screen.getByText("English"));

    expect(window.location.href).toBe("");
  });
});
