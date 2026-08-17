import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
  // src/lib/theme.ts persists state on <html> (data-theme/class) and in localStorage —
  // neither is scoped to a single render, so it leaks across tests unless reset here.
  document.documentElement.classList.remove("dark");
  delete document.documentElement.dataset.theme;
  localStorage.removeItem("theme");
});
