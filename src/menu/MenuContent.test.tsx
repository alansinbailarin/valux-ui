import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { MenuContent } from "./MenuContent";
import { MenuItem } from "./MenuItem";
import { MenuTrigger } from "./MenuTrigger";

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

describe("MenuContent", () => {
  it("is not rendered while closed", () => {
    render(
      <Menu>
        <MenuTrigger>+</MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens a labelled menu, focuses the first item, and closes on Escape", () => {
    reduceMotion();
    render(
      <Menu>
        <MenuTrigger>+</MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
          <MenuItem>Eliminar</MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("button"));
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("menuitem", { name: "Editar" })).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("inherits the nearest provider theme on the portal node", () => {
    reduceMotion();
    render(
      <div data-vx-provider="" data-vx-mode="dark" style={{ ["--vx-color-primary" as string]: "#123456" }}>
        <Menu defaultOpen>
          <MenuTrigger aria-label="Acciones">+</MenuTrigger>
          <MenuContent>
            <MenuItem>Editar</MenuItem>
          </MenuContent>
        </Menu>
      </div>,
    );

    const portal = document.querySelector("[data-vx-portal]");
    expect(portal).toHaveAttribute("data-vx-mode", "dark");
    expect(portal).toHaveAttribute("data-vx-provider");
    expect((portal as HTMLElement).style.cssText).toContain("--vx-color-primary");
  });

  it("adopts the trigger's solid colors when surface=\"trigger\"", () => {
    reduceMotion();
    render(
      <Menu defaultOpen>
        <MenuTrigger
          aria-label="Acciones"
          style={{ background: "rgb(28, 28, 30)", color: "rgb(255, 255, 255)" }}
        >
          +
        </MenuTrigger>
        <MenuContent surface="trigger">
          <MenuItem>Editar</MenuItem>
        </MenuContent>
      </Menu>,
    );

    const menu = screen.getByRole("menu");
    expect(menu.style.getPropertyValue("--vx-menu-surface")).toBe(
      "color-mix(in srgb, var(--vx-color-primary) 6%, rgb(28, 28, 30))",
    );
    expect(menu.style.color).toBe("rgb(255, 255, 255)");
  });

  it("activates the matching item when its shortcut is pressed", () => {
    reduceMotion();
    const onSelect = vi.fn();
    render(
      <Menu defaultOpen>
        <MenuTrigger aria-label="Acciones">+</MenuTrigger>
        <MenuContent>
          <MenuItem shortcut="⌘D" onSelect={onSelect}>
            Duplicar
          </MenuItem>
        </MenuContent>
      </Menu>,
    );

    fireEvent.keyDown(screen.getByRole("menu"), { key: "d", metaKey: true });

    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("has no accessibility violations while open", async () => {
    reduceMotion();
    const { baseElement } = render(
      <Menu open>
        <MenuTrigger aria-label="Acciones">+</MenuTrigger>
        <MenuContent>
          <MenuItem>Editar</MenuItem>
        </MenuContent>
      </Menu>,
    );
    // `region` is a page-level landmark rule, out of scope for an isolated
    // component test (the menu is portaled to <body> with no <main>).
    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});
