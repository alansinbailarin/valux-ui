import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menu } from "./Menu";
import { MenuTrigger } from "./MenuTrigger";
import { Button } from "../button";

describe("MenuTrigger asChild + Button (canonical themed trigger)", () => {
  it("merges menu behavior onto a library Button without losing either API", () => {
    render(
      <Menu>
        <MenuTrigger asChild>
          <Button color="primary" iconOnly aria-label="Crear">
            +
          </Button>
        </MenuTrigger>
      </Menu>,
    );

    const trigger = screen.getByRole("button", { name: "Crear" });
    // Both identities: themed Button + menu trigger.
    expect(trigger).toHaveClass("vx-button", "vx-menu-trigger");
    expect(trigger).toHaveAttribute("data-vx-color", "primary");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
