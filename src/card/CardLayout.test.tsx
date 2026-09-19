import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CardBody,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "./CardLayout";

describe("Card layout parts", () => {
  it("renders each part with its class", () => {
    render(
      <>
        <CardHeader data-testid="header" />
        <CardBody data-testid="body" />
        <CardFooter data-testid="footer" />
      </>,
    );
    expect(screen.getByTestId("header")).toHaveClass("vx-card__header");
    expect(screen.getByTestId("body")).toHaveClass("vx-card__body");
    expect(screen.getByTestId("footer")).toHaveClass("vx-card__footer");
  });

  it("renders the title as an h3 by default", () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByRole("heading", { level: 3, name: "Title" });
    expect(title).toHaveClass("vx-card__title");
  });

  it("honors the title `as` heading level", () => {
    render(<CardTitle as="h2">Top</CardTitle>);
    expect(
      screen.getByRole("heading", { level: 2, name: "Top" }),
    ).toBeInTheDocument();
  });

  it("renders the subtitle with its class", () => {
    render(<CardSubtitle data-testid="sub">Sub</CardSubtitle>);
    expect(screen.getByTestId("sub")).toHaveClass("vx-card__subtitle");
  });

  it("merges caller classNames", () => {
    render(<CardBody data-testid="body" className="extra" />);
    expect(screen.getByTestId("body")).toHaveClass("vx-card__body", "extra");
  });
});
