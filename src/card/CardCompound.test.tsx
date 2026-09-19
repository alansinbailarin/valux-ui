import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

describe("Card compound component", () => {
  it("exposes all anatomy parts on the root", () => {
    expect(Card.Media).toBeDefined();
    expect(Card.Header).toBeDefined();
    expect(Card.Title).toBeDefined();
    expect(Card.Subtitle).toBeDefined();
    expect(Card.Body).toBeDefined();
    expect(Card.Footer).toBeDefined();
    expect(Card.Separator).toBeDefined();
  });

  it("renders the full anatomy composed", () => {
    render(
      <Card data-testid="card" variant="elevated">
        <Card.Media src="/c.jpg" alt="Cover" />
        <Card.Header>
          <Card.Title>Title</Card.Title>
          <Card.Subtitle>Sub</Card.Subtitle>
        </Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.querySelector(".vx-card__media")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("Body")).toHaveClass("vx-card__body");
    expect(screen.getByText("Footer")).toHaveClass("vx-card__footer");
  });

  it("renders bare children with no parts (all anatomy optional)", () => {
    render(<Card data-testid="card">Just text</Card>);
    expect(screen.getByTestId("card")).toHaveTextContent("Just text");
  });
});
