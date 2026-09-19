import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Card } from "./index";

describe("Card SSR", () => {
  it("renders the full anatomy to a string without a DOM", () => {
    const html = renderToString(
      <Card variant="soft">
        <Card.Media src="/c.jpg" alt="" />
        <Card.Header>
          <Card.Title>Title</Card.Title>
        </Card.Header>
        <Card.Body>Body</Card.Body>
      </Card>,
    );
    expect(html).toContain("vx-card");
    expect(html).toContain('data-vx-variant="soft"');
    expect(html).toContain("vx-card__media");
  });
});
