import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./index";

type ManualAnimation = {
  cancel: () => void;
  pause: () => void;
  play: () => void;
  playbackRate: number;
  currentTime: number;
  effect: { getTiming: () => { duration: number } };
  onfinish: null | (() => void);
};

function installManualAnimate() {
  const animations: ManualAnimation[] = [];
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: vi.fn(() => {
      const animation: ManualAnimation = {
        cancel: vi.fn(),
        pause: vi.fn(),
        play: vi.fn(),
        playbackRate: 1,
        currentTime: 0,
        effect: { getTiming: () => ({ duration: 560 }) },
        onfinish: null,
      };
      animations.push(animation);
      return animation as unknown as Animation;
    }),
  });
  return {
    animations,
    finishAll: () =>
      act(() => {
        for (const animation of animations.splice(0)) animation.onfinish?.();
      }),
  };
}

afterEach(async () => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
  vi.useRealTimers();
  // Let a committed gesture's document-level inertia swallower expire so it
  // cannot eat the next test's wheel events.
  await new Promise((resolve) => setTimeout(resolve, 200));
});

describe("Dialog pull-to-close scrub", () => {
  it("two-finger swipe scrubs the close morph and commits past the threshold", () => {
    const { animations, finishAll } = installManualAnimate();
    render(
      <Dialog>
        <Dialog.Trigger>Abrir</Dialog.Trigger>
        <Dialog.Content aria-label="Editar">
          <input aria-label="Nombre" />
        </Dialog.Content>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    finishAll(); // open morph done -> phase "open", scrub hook armed

    const dialog = screen.getByRole("dialog");
    // Fingers moving down = negative deltaY; the scrub owns the wheel.
    const blocked = fireEvent.wheel(document.body, {
      deltaY: -300,
      cancelable: true,
    });
    expect(blocked).toBe(false); // preventDefault called -> no scrolling
    const scrub = animations[animations.length - 1];
    expect(scrub.pause).toHaveBeenCalled();

    // Crossing 45% of the 260px budget commits RIGHT THEN: the scrub plays to
    // the end, and trailing trackpad inertia must be swallowed (no new
    // animations, no restarted timers — that stall was a real bug).
    expect(scrub.play).toHaveBeenCalled();
    const animationCount = animations.length;
    fireEvent.wheel(document.body, { deltaY: -60, cancelable: true });
    fireEvent.wheel(document.body, { deltaY: -20, cancelable: true });
    expect(animations.length).toBe(animationCount);

    act(() => scrub.onfinish?.());
    expect(dialog).toHaveAttribute("data-vx-skip-morph");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reversing the swipe back to zero rewinds instead of closing", () => {
    const { animations, finishAll } = installManualAnimate();
    render(
      <Dialog>
        <Dialog.Trigger>Abrir</Dialog.Trigger>
        <Dialog.Content aria-label="Editar">contenido</Dialog.Content>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    finishAll();

    fireEvent.wheel(document.body, { deltaY: -100, cancelable: true });
    const scrub = animations[animations.length - 1];
    fireEvent.wheel(document.body, { deltaY: 120, cancelable: true }); // pull back up

    expect(scrub.playbackRate).toBeLessThan(0); // rewinding to fully open
    act(() => scrub.onfinish?.());
    expect(scrub.cancel).toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
