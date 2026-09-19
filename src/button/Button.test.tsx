import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./index";
import type { ButtonProps } from "./index";

describe("Button", () => {
  it("renders an accessible native button with a safe default type", () => {
    const props: ButtonProps = { children: "Save" };

    render(<Button {...props} />);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("forwards native props, className, and ref", () => {
    const ref = createRef<HTMLButtonElement>();

    render(
      <Button
        ref={ref}
        type="submit"
        className="consumer-class"
        disabled
        aria-label="Submit form"
        data-purpose="save"
      />,
    );

    const button = screen.getByRole("button", { name: "Submit form" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("data-purpose", "save");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("vx-button", "consumer-class");
    expect(ref.current).toBe(button);
  });

  it("renders a typed anchor and forwards its native props and ref", () => {
    const ref = createRef<HTMLAnchorElement>();

    render(
      <Button
        as="a"
        ref={ref}
        href="/docs"
        target="_blank"
        rel="noreferrer"
      >
        Documentation
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Documentation" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("target", "_blank");
    expect(ref.current).toBe(link);
  });

  it("disables anchors without navigation or consumer clicks", () => {
    const onClick = vi.fn();
    render(
      <Button as="a" href="/billing" disabled onClick={onClick}>
        Billing
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Billing" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(fireEvent.click(link)).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses a configurable cursor without discarding consumer styles", () => {
    render(
      <Button cursor="grab" style={{ marginTop: 4 }}>
        Drag
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Drag" })).toHaveStyle({
      cursor: "grab",
      marginTop: "4px",
    });
  });

  it("forces a not-allowed cursor when disabled", () => {
    render(
      <Button disabled cursor="grab" style={{ marginTop: 4 }}>
        Disabled
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Disabled" })).toHaveStyle({
      cursor: "not-allowed",
      marginTop: "4px",
    });
  });

  it("forces a not-allowed cursor while loading", () => {
    render(
      <Button as="a" href="/save" loading cursor="grab">
        Save
      </Button>,
    );

    expect(screen.getByRole("link", { name: "Save" })).toHaveStyle({
      cursor: "not-allowed",
    });
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <>
        <Button>Continue</Button>
        <Button as="a" href="/docs" disabled>
          Documentation
        </Button>
      </>,
    );

    const results = await axe(container);

    expect(results.violations).toHaveLength(0);
  });

  it("renders both element branches on the server", () => {
    expect(renderToString(<Button>Save</Button>)).toContain("<button");
    const linkHtml = renderToString(
      <Button as="a" href="/docs">
        Docs
      </Button>,
    );
    expect(linkHtml).toContain("<a");
    expect(linkHtml).toContain('href="/docs"');
  });
});
