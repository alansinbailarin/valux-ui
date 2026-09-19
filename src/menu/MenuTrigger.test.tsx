import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menu } from "./Menu";
import { MenuTrigger } from "./MenuTrigger";

describe("MenuTrigger", () => {
  it("toggles the menu and exposes aria-haspopup/expanded", () => {
    render(
      <Menu>
        <MenuTrigger>+</MenuTrigger>
      </Menu>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("marks itself hidden while the menu is open", () => {
    render(
      <Menu open>
        <MenuTrigger>+</MenuTrigger>
      </Menu>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-vx-menu-origin",
      "hidden",
    );
  });
});
