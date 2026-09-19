import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardMedia } from "./CardMedia";

describe("CardMedia", () => {
  it("renders a cover img from the src shortcut", () => {
    render(<CardMedia data-testid="media" src="/cover.jpg" alt="Cover" />);
    const media = screen.getByTestId("media");
    expect(media).toHaveClass("vx-card__media");
    const img = screen.getByRole("img", { name: "Cover" });
    expect(img).toHaveAttribute("src", "/cover.jpg");
    expect(img).toHaveClass("vx-card__media-img");
  });

  it("defaults to a decorative empty alt", () => {
    render(<CardMedia src="/cover.jpg" data-testid="media" />);
    const img = screen.getByTestId("media").querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  it("reserves the aspect ratio inline (default 16/9)", () => {
    render(<CardMedia data-testid="media" src="/c.jpg" />);
    expect(screen.getByTestId("media").style.aspectRatio).toMatch(/^1\.7{4,}/);
  });

  it("renders children in an overlay layer", () => {
    render(
      <CardMedia data-testid="media" src="/c.jpg">
        <span>Over</span>
      </CardMedia>,
    );
    const overlay = screen.getByText("Over").parentElement;
    expect(overlay).toHaveClass("vx-card__media-overlay");
  });

  it("works with free children and no src", () => {
    render(
      <CardMedia data-testid="media">
        <span>Gradient</span>
      </CardMedia>,
    );
    expect(screen.getByTestId("media").querySelector("img")).toBeNull();
    expect(screen.getByText("Gradient")).toBeInTheDocument();
  });
});
