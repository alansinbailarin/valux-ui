import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card root", () => {
  it("renders a div with the base class and default outline variant", () => {
    render(<Card data-testid="card">Hello</Card>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveClass("vx-card");
    expect(card).toHaveAttribute("data-vx-variant", "outline");
    expect(card).toHaveTextContent("Hello");
  });

  it("applies the requested variant", () => {
    render(<Card data-testid="card" variant="elevated" />);
    expect(screen.getByTestId("card")).toHaveAttribute(
      "data-vx-variant",
      "elevated",
    );
  });

  it("merges a caller className after the base class", () => {
    render(<Card data-testid="card" className="extra" />);
    expect(screen.getByTestId("card")).toHaveClass("vx-card", "extra");
  });

  it("forwards its ref to the root element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
