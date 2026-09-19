import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { MenuTrigger } from "./MenuTrigger";

describe("MenuTrigger asChild", () => {
  it("merges menu behavior onto the consumer's own element", () => {
    const onClick = vi.fn();
    render(
      <Menu>
        <MenuTrigger asChild>
          <button className="consumer" data-role="fab" onClick={onClick}>
            +
          </button>
        </MenuTrigger>
      </Menu>,
    );

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("data-role", "fab");
    expect(trigger).toHaveClass("vx-menu-trigger", "consumer");

    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("wraps the child's content so the morph choreography still applies", () => {
    render(
      <Menu>
        <MenuTrigger asChild>
          <button>+</button>
        </MenuTrigger>
      </Menu>,
    );

    const content = screen
      .getByRole("button")
      .querySelector(".vx-menu-trigger__content");
    expect(content).toHaveTextContent("+");
  });
});
