import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

/** The "customizable inside" API: per-section surface, padding control,
 * the separator, and the instance tokens. Everything maps to a data
 * attribute or a custom property, so the CSS keeps the actual values. */
describe("Card interior API", () => {
  it("defaults every section to the card's own surface", () => {
    render(
      <Card>
        <Card.Header data-testid="header" />
        <Card.Body data-testid="body" />
        <Card.Footer data-testid="footer" />
      </Card>,
    );
    for (const id of ["header", "body", "footer"]) {
      expect(screen.getByTestId(id)).toHaveAttribute("data-vx-surface", "none");
    }
  });

  it.each(["Header", "Body", "Footer"] as const)(
    "lets Card.%s sit on the subtle plane",
    (part) => {
      const Part = Card[part];
      render(<Part data-testid="part" surface="subtle" />);
      expect(screen.getByTestId("part")).toHaveAttribute(
        "data-vx-surface",
        "subtle",
      );
    },
  );

  it("defaults the root padding and lets it be turned off", () => {
    const { rerender } = render(<Card data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveAttribute(
      "data-vx-padding",
      "default",
    );

    rerender(<Card data-testid="card" padding="none" />);
    expect(screen.getByTestId("card")).toHaveAttribute(
      "data-vx-padding",
      "none",
    );
  });

  it("takes a per-part padding override and omits the attribute otherwise", () => {
    render(
      <Card>
        <Card.Body data-testid="inherits" />
        <Card.Footer data-testid="bleeds" padding="none" />
      </Card>,
    );
    // No attribute means "inherit the card's spacing tokens" — emitting
    // data-vx-padding="default" here would override a root padding="none".
    expect(screen.getByTestId("inherits")).not.toHaveAttribute(
      "data-vx-padding",
    );
    expect(screen.getByTestId("bleeds")).toHaveAttribute(
      "data-vx-padding",
      "none",
    );
  });

  it("renders a separator as an exposed <hr>, edge to edge by default", () => {
    render(<Card.Separator data-testid="sep" />);
    const separator = screen.getByTestId("sep");
    expect(separator.tagName).toBe("HR");
    expect(separator).toHaveClass("vx-card__separator");
    expect(separator).toHaveAttribute("data-vx-inset", "none");
    expect(screen.getByRole("separator")).toBe(separator);
  });

  it("insets the separator to the content edge on request", () => {
    render(<Card.Separator data-testid="sep" inset="content" />);
    expect(screen.getByTestId("sep")).toHaveAttribute(
      "data-vx-inset",
      "content",
    );
  });

  it("puts the instance tokens on the card element so parts inherit them", () => {
    render(
      <Card
        data-testid="card"
        style={
          {
            "--vx-card-padding": "1.5rem",
            "--vx-card-gap": "0.75rem",
            "--vx-card-shadow": "0 0 0 1px red",
            "--vx-card-border-alpha": "30%",
            "--vx-card-elevated-bg": "rebeccapurple",
            "--vx-card-elevated-shadow": "none",
          } as React.CSSProperties
        }
      >
        <Card.Body data-testid="body">Body</Card.Body>
      </Card>,
    );
    const card = screen.getByTestId("card");
    for (const [token, value] of [
      ["--vx-card-padding", "1.5rem"],
      ["--vx-card-gap", "0.75rem"],
      ["--vx-card-shadow", "0 0 0 1px red"],
      ["--vx-card-border-alpha", "30%"],
      ["--vx-card-elevated-bg", "rebeccapurple"],
      ["--vx-card-elevated-shadow", "none"],
    ]) {
      expect(card.style.getPropertyValue(token)).toBe(value);
    }
    // The parts are descendants, so the custom properties inherit down.
    expect(card).toContainElement(screen.getByTestId("body"));
  });

  it("composes the grouped-settings layout", () => {
    render(
      <Card data-testid="card" variant="soft">
        <Card.Header data-testid="header" surface="subtle">
          <Card.Title>Settings</Card.Title>
        </Card.Header>
        <Card.Separator data-testid="sep" inset="content" />
        <Card.Body>Rows</Card.Body>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("data-vx-variant", "soft");
    expect(card.children[0]).toBe(screen.getByTestId("header"));
    expect(card.children[1]).toBe(screen.getByTestId("sep"));
  });
});
