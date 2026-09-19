import { useEffect } from "react";
import type { RefObject } from "react";

import type { MorphPreset } from "./morphKeyframes";
import { prefersReducedMotion } from "./reducedMotion";
import { COMMIT_AT, createScrubController, TRAVEL_PX } from "./scrubController";
import { canScrollUp } from "../a11y/scrollableChain";

interface CloseScrubOptions {
  panelRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  preset?: MorphPreset;
  active: boolean;
  onDismiss: () => void;
}

/** Pull-to-close for MORPHING surfaces (menu, dialog): the gesture — finger
 * drag on touch, two-finger swipe anywhere on trackpads — scrubs the return
 * morph itself instead of translating the panel. */
export function useCloseScrub({
  panelRef,
  triggerRef,
  preset,
  active,
  onDismiss,
}: CloseScrubOptions): void {
  useEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!active || !panel || !trigger || prefersReducedMotion() || typeof panel.animate !== "function") return;

    const scrub = createScrubController(panel, trigger, preset, onDismiss);
    let offset = 0, startY = 0, dragging = false;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const settleNow = () => {
      scrub.settle(offset);
      offset = 0;
    };

    const onWheel = (event: WheelEvent) => {
      if (scrub.committed) return event.preventDefault(); // swallow trailing inertia
      // Two-finger swipe down = negative deltaY; works inside AND outside.
      // Inside, the gesture only begins once nothing under the cursor can
      // still scroll up (e.g. a Dialog.Body scrolled below its top).
      const inside = panel.contains(event.target as Node);
      if (!scrub.active() && (event.deltaY >= 0 || (inside && canScrollUp(event.target, panel)))) return;
      event.preventDefault(); // the gesture owns the wheel — no scrolling
      // A fast flick commits outright (an inertia crawl read as a stall)
      if (-event.deltaY > 120) offset = TRAVEL_PX;
      else offset = Math.max(0, offset - event.deltaY);
      scrub.apply(offset);
      clearTimeout(settleTimer);
      if (offset / TRAVEL_PX >= COMMIT_AT || offset === 0) settleNow(); // commit RIGHT THEN
      else settleTimer = setTimeout(settleNow, 160);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (scrub.committed || event.button !== 0) return;
      if (!panel.contains(event.target as Node)) return;
      startY = event.clientY;
      dragging = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (scrub.committed || event.buttons === 0) return;
      const dy = event.clientY - startY;
      if (!dragging) {
        if (dy < 8 || !panel.contains(event.target as Node)) return;
        if (canScrollUp(event.target, panel)) return;
        dragging = true;
        panel.setPointerCapture?.(event.pointerId);
      }
      offset = Math.max(0, dy);
      scrub.apply(offset);
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      settleNow();
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    panel.addEventListener("pointerdown", onPointerDown);
    panel.addEventListener("pointermove", onPointerMove);
    panel.addEventListener("pointerup", onPointerUp);
    panel.addEventListener("pointercancel", onPointerUp);
    return () => {
      clearTimeout(settleTimer);
      scrub.dispose();
      document.removeEventListener("wheel", onWheel);
      panel.removeEventListener("pointerdown", onPointerDown);
      panel.removeEventListener("pointermove", onPointerMove);
      panel.removeEventListener("pointerup", onPointerUp);
      panel.removeEventListener("pointercancel", onPointerUp);
    };
  }, [panelRef, triggerRef, preset, active, onDismiss]);
}
