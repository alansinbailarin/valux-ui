import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./index";

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

describe("Dialog open/close race recovery", () => {
  it("re-opens when the trigger is toggled while the close morph is in flight", () => {
    const { finishAll } = installManualAnimate();
    render(
      <div>
        <Dialog>
          <Dialog.Trigger>Abrir</Dialog.Trigger>
          <Dialog.Content aria-label="Editar">
            <button>campo</button>
          </Dialog.Content>
        </Dialog>
        <button>fuera</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "Abrir" });

    fireEvent.click(trigger);
    finishAll();
    fireEvent.pointerDown(screen.getByText("fuera"));
    fireEvent.click(trigger); // toggle mid-close
    finishAll();

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    finishAll();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
