import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

describe("Card accessibility", () => {
  it("full anatomy has no axe violations", async () => {
    const { container } = render(
      <main>
        <Card>
          <Card.Media src="/cover.jpg" alt="Team photo" />
          <Card.Header>
            <Card.Title>Quarterly report</Card.Title>
            <Card.Subtitle>Q2 2026</Card.Subtitle>
          </Card.Header>
          <Card.Body>Revenue grew 12%.</Card.Body>
          <Card.Footer>
            <button type="button">Open</button>
          </Card.Footer>
        </Card>
      </main>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it("decorative media is hidden from the accessibility tree", async () => {
    const { container } = render(
      <main>
        <Card>
          <Card.Media src="/decor.jpg" />
          <Card.Body>Text</Card.Body>
        </Card>
      </main>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
