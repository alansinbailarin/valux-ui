import type { Locator } from "@playwright/test";

export interface Point {
  x: number;
  y: number;
}

/**
 * Simulates a touch drag by dispatching a pointerdown / N x pointermove /
 * pointerup sequence with `pointerType: "touch"` directly on `target`.
 *
 * Playwright's `page.touchscreen` only exposes `.tap()` (no drag
 * primitive), and CDP's `Input.dispatchTouchEvent` is Chromium-only, so it
 * cannot drive the webkit / mobile-safari projects. Dispatching pointer
 * events straight at the DOM node the kit's gesture hooks actually listen
 * on (see `moveTarget`) sidesteps both limitations and exercises the exact
 * same listener code path a real touch drag would.
 *
 * Caveat: because this bypasses the browser's real touch-input pipeline,
 * it does NOT reproduce browser-synthesized compatibility mouse/click
 * events that follow a genuine touchstart/touchmove/touchend sequence on
 * real hardware (or Chromium's own touch simulation). Tests that depend on
 * that specific behavior should call it out explicitly.
 *
 * Steps are dispatched as SEPARATE round-trips (one `evaluate()` per event,
 * spaced by `frameMs`), not batched into one synchronous burst. Several of
 * the gesture hooks under test (`useToastSwipe`, `usePullDismiss`) derive a
 * velocity from `(clientY|clientX delta) / (timeStamp delta)`; batching
 * every event into a single microtask would give every `PointerEvent` a
 * near-identical `timeStamp`, producing meaningless (near-infinite)
 * velocity spikes that would make even a slow, small drag read as a flick.
 * Real per-frame spacing keeps velocity numbers physically plausible.
 *
 * @param target The element to dispatch `pointerdown` on.
 * @param from Starting point in viewport coordinates.
 * @param to Ending point in viewport coordinates.
 * @param options.steps Number of intermediate `pointermove` events (default 12).
 * @param options.moveTarget Where `pointermove`/`pointerup` are dispatched:
 *   "element" (same node as pointerdown — e.g. usePullDismiss/useToastSwipe,
 *   which listen on the panel/card itself) or "document" (e.g.
 *   useSwitchDrag, which listens on `document` after the initial
 *   pointerdown on the track).
 * @param options.frameMs Delay between successive events, ms (default 16 — one frame at 60fps).
 */
export async function dragTouch(
  target: Locator,
  from: Point,
  to: Point,
  options: { steps?: number; moveTarget?: "element" | "document"; frameMs?: number } = {},
): Promise<void> {
  const { steps = 12, moveTarget = "element", frameMs = 16 } = options;
  const page = target.page();

  const dispatch = (type: string, x: number, y: number, buttons: number) =>
    target.evaluate(
      (el, { type, x, y, buttons, moveTarget }) => {
        const node: EventTarget = type === "pointerdown" ? el : moveTarget === "document" ? document : el;
        node.dispatchEvent(
          new PointerEvent(type, {
            pointerId: 1,
            pointerType: "touch",
            isPrimary: true,
            bubbles: true,
            cancelable: true,
            composed: true,
            clientX: x,
            clientY: y,
            buttons,
          }),
        );
      },
      { type, x, y, buttons, moveTarget },
    );

  await dispatch("pointerdown", from.x, from.y, 1);
  await page.waitForTimeout(frameMs);
  for (let i = 1; i <= steps; i++) {
    const x = from.x + (to.x - from.x) * (i / steps);
    const y = from.y + (to.y - from.y) * (i / steps);
    await dispatch("pointermove", x, y, 1);
    await page.waitForTimeout(frameMs);
  }
  await dispatch("pointerup", to.x, to.y, 0);
}
