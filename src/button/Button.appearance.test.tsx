import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Button } from "./index";

const variants = ["solid", "outline", "soft", "ghost"] as const;
const colors = [
  "neutral",
  "primary",
  "danger",
  "success",
  "warning",
  "info",
] as const;
const combinations = variants.flatMap((variant) =>
  colors.map((color) => [variant, color] as const),
);

describe("Button appearance", () => {
  it("defaults to a solid neutral appearance", () => {
    render(<Button>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-vx-variant", "solid");
    expect(button).toHaveAttribute("data-vx-color", "neutral");
  });

  it.each(combinations)("supports %s with %s", (variant, color) => {
    render(
      <Button variant={variant} color={color}>
        Continue
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("data-vx-variant", variant);
    expect(button).toHaveAttribute("data-vx-color", color);
  });

  it("inherits provider density with no explicit size", () => {
    render(<Button>Continue</Button>);

    expect(
      screen.getByRole("button", { name: "Continue" }),
    ).not.toHaveAttribute("data-vx-size");
  });

  it.each(["xs", "sm", "md", "lg"] as const)(
    "applies an explicit %s size override",
    (size) => {
      render(<Button size={size}>Continue</Button>);

      expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute(
        "data-vx-size",
        size,
      );
    },
  );

  it("keeps the full appearance matrix accessible", async () => {
    const { container } = render(
      <>
        {combinations.map(([variant, color]) => (
          <Button key={`${variant}-${color}`} variant={variant} color={color}>
            {variant} {color}
          </Button>
        ))}
      </>,
    );

    expect((await axe(container)).violations).toHaveLength(0);
  });
});
