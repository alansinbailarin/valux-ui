import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";
import { MenuContent } from "./MenuContent";
import { MenuItem } from "./MenuItem";
import { MenuTrigger } from "./MenuTrigger";

type ManualAnimation = { cancel: () => void; onfinish: null | (() => void) };

function installManualAnimate() {
  const animations: ManualAnimation[] = [];
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: vi.fn(() => {
      const animation: ManualAnimation = { cancel: vi.fn(), onfinish: null };
      animations.push(animation);
      return animation as unknown as Animation;
    }),
  });
  return {
    finishAll: () =>
      act(() => {
        for (const animation of animations.splice(0)) animation.onfinish?.();
      }),
  };
}

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
});

describe("Menu open/close race recovery", () => {
  it("re-opens when the trigger is toggled while the close morph is in flight", () => {
    const { finishAll } = installManualAnimate();
    render(
      <div>
        <Menu>
          <MenuTrigger>+</MenuTrigger>
          <MenuContent>
            <MenuItem>Editar</MenuItem>
          </MenuContent>
        </Menu>
        <button>fuera</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "+" });

    fireEvent.click(trigger);
    finishAll(); // open morph settles
    fireEvent.pointerDown(screen.getByRole("button", { name: "fuera" }));
    // While the close morph is STILL RUNNING, the trigger toggles open again
    // (the burst of clicks that used to wedge the phase machine).
    fireEvent.click(trigger);
    finishAll(); // whatever morph is in flight settles

    expect(screen.getByRole("menu")).toBeInTheDocument();

    // And it still closes and reopens normally afterwards.
    fireEvent.keyDown(document, { key: "Escape" });
    finishAll();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    finishAll();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
