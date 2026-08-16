import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Pagination } from "@/components/Pagination.tsx";

describe("Pagination Component", () => {
  test("renders the correct page numbers based on display prop and currentPage", () => {
    render(<Pagination total={10} currentPage={5} basePath="/pages" display={3} prev="/pages/4" next="/pages/6" />);
    const pages = screen.queryAllByText(/^[0-9]+$/);

    expect(pages.map((page) => page.textContent)).toEqual(["4", "5", "6"]);
  });

  test("disables previous button when `prev` is not provided", () => {
    render(<Pagination total={10} currentPage={1} basePath="/pages" display={3} next="/pages/2" />);
    const prevButton = screen.getByTestId("pagination-previous");

    expect(prevButton).toHaveClass("opacity-50");
  });

  test("disables next button when `next` is not provided", () => {
    render(<Pagination total={10} currentPage={10} basePath="/pages" display={3} prev="/pages/9" />);
    const nextButton = screen.getByTestId("pagination-next");

    expect(nextButton).toHaveClass("opacity-50");
  });

  test("renders ellipsis when there are skipped pages before the displayed range", () => {
    render(<Pagination total={10} currentPage={9} basePath="/pages" display={3} prev="/pages/4" next="/pages/6" />);
    const ellipsis = screen.getByTestId("pagination-ellipsis");

    expect(ellipsis).toBeInTheDocument();
  });

  test("renders ellipsis when there are skipped pages after the displayed range", () => {
    render(<Pagination total={10} currentPage={2} basePath="/pages" display={3} next="/pages/2" />);
    const ellipsis = screen.getByTestId("pagination-ellipsis");

    expect(ellipsis).toBeInTheDocument();
  });

  test("renders correct link for each page number", () => {
    render(<Pagination total={10} currentPage={5} basePath="/pages" display={3} prev="/pages/4" next="/pages/6" />);
    const pageLinks = screen.getAllByRole("link");

    expect(pageLinks[1]).toHaveAttribute("href", "/pages/4");
    expect(pageLinks[2]).toHaveAttribute("href", "/pages/5");
    expect(pageLinks[3]).toHaveAttribute("href", "/pages/6");
  });

  test("highlights the current page as active", () => {
    render(<Pagination total={10} currentPage={5} basePath="/pages" display={3} prev="/pages/4" next="/pages/6" />);
    const activePage = screen.getByText("5");

    expect(activePage).toHaveAttribute("aria-current", "page");
  });
});
