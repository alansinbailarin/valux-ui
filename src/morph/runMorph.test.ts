import { afterEach, describe, expect, it, vi } from "vitest";

import { runMorph } from "./runMorph";

function element(rect: { width: number; height: number }) {
  const el = document.createElement("div");
  // Same as the real placement effect: panels anchored at their trigger
  // scale about the shared corner, so the morph needs no travel component.
  el.style.transformOrigin = "0px 0px";
  el.getBoundingClientRect = vi.fn(
    () =>
      ({
        top: 0,
        left: 0,
        right: rect.width,
        bottom: rect.height,
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
        toJSON() {},
      }) as DOMRect,
  );
  return el;
}

function mockAnimate() {
  const created: Array<{ cancel: ReturnType<typeof vi.fn> }> = [];
  const animate = vi.fn(() => {
    const animation = {
      cancel: vi.fn(),
      onfinish: null as null | (() => void),
    };
    created.push(animation);
    queueMicrotask(() => animation.onfinish?.());
    return animation as unknown as Animation;
  });
  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    value: animate,
  });
  return { animate, created };
}

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

describe("runMorph", () => {
  it("animates from the trigger scale as a rounded circle and resolves onFinish", async () => {
    const { animate } = mockAnimate();
    const trigger = element({ width: 56, height: 56 });
    const panel = element({ width: 200, height: 180 });
    const onFinish = vi.fn();

    runMorph({ panel, trigger, direction: "open", onFinish });
    await Promise.resolve();

    const [frames] = animate.mock.calls[0] as unknown as [Keyframe[]];
    expect(frames[0].transform).toBe(`scale(${56 / 200},${56 / 180})`);
    // Compensated landing radius: renders as the 28px trigger circle once the
    // non-uniform (bx, by) scale applies — "999px" deformed into a squashed pill.
    expect(frames[0].borderRadius).toBe("100px / 90px");
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it("cancels the settled open animation so no residual filter blocks backdrop-filter", async () => {
    const { created } = mockAnimate();
    const trigger = element({ width: 56, height: 56 });
    const panel = element({ width: 200, height: 180 });

    runMorph({ panel, trigger, direction: "open", onFinish: () => {} });
    await Promise.resolve();

    // fill:forwards would keep filter: blur(0px) applied forever, which makes
    // the panel its own backdrop root and kills the glass effect at rest.
    expect(created[0].cancel).toHaveBeenCalledOnce();
  });

  it("skips animation and finishes immediately under reduced motion", () => {
    const { animate } = mockAnimate();
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const onFinish = vi.fn();

    runMorph({
      panel: element({ width: 200, height: 180 }),
      trigger: element({ width: 56, height: 56 }),
      direction: "open",
      onFinish,
    });

    expect(animate).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledOnce();
  });
});
