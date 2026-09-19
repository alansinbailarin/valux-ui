import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "./index";

function installAnimationMock() {
  const animations: Array<{ cancel: ReturnType<typeof vi.fn> }> = [];
  const animate = vi.fn(() => {
    const animation = { cancel: vi.fn() };
    animations.push(animation);
    return animation as unknown as Animation;
  });
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  return { animate, animations };
}

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

describe("Button motion", () => {
  it("captures the pointer for mouse but NEVER for touch (WebKit kills tap clicks)", () => {
    installAnimationMock();
    const capture = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
      configurable: true,
      value: capture,
    });
    render(<Button>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });

    fireEvent.pointerDown(button, { button: 0, pointerId: 7, pointerType: "touch" });
    expect(capture).not.toHaveBeenCalled();
    fireEvent.pointerUp(button, { button: 0, pointerId: 7, pointerType: "touch" });

    fireEvent.pointerDown(button, { button: 0, pointerId: 8, pointerType: "mouse" });
    expect(capture).toHaveBeenCalledWith(8);
    Reflect.deleteProperty(HTMLElement.prototype, "setPointerCapture");
  });

  it.each(["mouse", "touch"])(
    "compresses on %s press and rebounds on release",
    (pointerType) => {
      const { animate, animations } = installAnimationMock();
      render(<Button>Continue</Button>);
      const button = screen.getByRole("button", { name: "Continue" });

      fireEvent.pointerDown(button, { button: 0, pointerId: 1, pointerType });
      fireEvent.pointerUp(button, { button: 0, pointerId: 1, pointerType });

      expect(animate).toHaveBeenNthCalledWith(
        1,
        [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(1px) scaleX(0.982) scaleY(0.955)" },
        ],
        {
          duration: 140,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
          fill: "forwards",
        },
      );
      expect(animate).toHaveBeenNthCalledWith(
        2,
        [
          {
            transform: "translateY(1px) scaleX(0.982) scaleY(0.955)",
            offset: 0,
          },
          {
            transform: "translateY(-0.5px) scaleX(1.008) scaleY(1.012)",
            offset: 0.52,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
          { transform: "translateY(0) scale(1)", offset: 1 },
        ],
        { duration: 300, easing: "linear" },
      );
      expect(animations[0]?.cancel).toHaveBeenCalledOnce();
    },
  );

  it("preserves consumer pointer handlers", () => {
    const { animate } = installAnimationMock();
    const onPointerDown = vi.fn();
    const onPointerUp = vi.fn();
    render(
      <Button onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        Continue
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Continue" });

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    fireEvent.pointerUp(button, { button: 0, pointerId: 1 });

    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onPointerUp).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it("skips motion when disabled or reduced motion is requested", () => {
    const { animate } = installAnimationMock();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const { rerender } = render(<Button>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });

    fireEvent.pointerDown(button, { button: 0, pointerId: 1 });
    fireEvent.pointerUp(button, { button: 0, pointerId: 1 });
    rerender(<Button disabled>Continue</Button>);
    fireEvent.pointerDown(button, { button: 0, pointerId: 2 });

    expect(animate).not.toHaveBeenCalled();
  });

  it("returns to rest when disabled during an active press", () => {
    const { animate } = installAnimationMock();
    const { rerender } = render(<Button>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });

    fireEvent.pointerDown(button, { button: 0, pointerId: 7 });
    rerender(<Button disabled>Continue</Button>);

    expect(animate).toHaveBeenLastCalledWith(
      [{ transform: "translateY(0) scale(1)" }],
      {
        duration: 140,
        easing: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    );
  });

  it("does not animate keyboard activation", () => {
    const { animate } = installAnimationMock();
    render(<Button>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });

    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyUp(button, { key: " " });

    expect(animate).not.toHaveBeenCalled();
  });
});
