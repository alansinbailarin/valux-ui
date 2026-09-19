import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./index";

const icon = <svg data-testid="test-icon" />;

describe("Button content states", () => {
  it("disables a loading native Button while preserving its name", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("data-vx-loading");
    expect(button.querySelector(".vx-button__spinner")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses disabled link semantics while loading", () => {
    render(
      <Button as="a" href="/save" loading>
        Save
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Save" });
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("href");
  });

  it("shows optional custom content beside the loading spinner", () => {
    render(
      <Button loading loadingText={<span>Saving changes...</span>}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Saving changes..." });
    expect(button.querySelector(".vx-button__loading-text")).toHaveTextContent(
      "Saving changes...",
    );
    expect(button.querySelector(".vx-button__content")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(button.querySelector(".vx-button__spinner")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("keeps icon-only loading visually icon-only", () => {
    render(
      <Button
        iconOnly
        aria-label="Save changes"
        loading
        loadingText="Saving changes..."
      >
        {icon}
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button).not.toHaveTextContent("Saving changes...");
    expect(button.querySelector(".vx-button__spinner")).toBeInTheDocument();
  });

  it("renders decorative leading and trailing icon slots", () => {
    render(
      <Button startIcon={icon} endIcon={icon}>
        Continue
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button.querySelector(".vx-button__icon--start")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(button.querySelector(".vx-button__icon--end")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getAllByTestId("test-icon")).toHaveLength(2);
  });

  it("supports an accessible icon-only mode", () => {
    render(
      <Button iconOnly aria-label="Open settings">
        {icon}
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Open settings" })).toHaveAttribute(
      "data-vx-icon-only",
    );
  });

  it("supports full width independently of its element", () => {
    render(
      <Button as="a" href="/docs" fullWidth>
        Documentation
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Documentation" })).toHaveAttribute(
      "data-vx-full-width",
    );
  });

  it("keeps combined content modes accessible", async () => {
    const { container } = render(
      <>
        <Button loading startIcon={icon}>Loading</Button>
        <Button iconOnly aria-label="Favorite">{icon}</Button>
        <Button as="a" href="/next" endIcon={icon}>Next</Button>
      </>,
    );

    expect((await axe(container)).violations).toHaveLength(0);
  });
});
