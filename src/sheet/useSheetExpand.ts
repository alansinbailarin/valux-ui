import { useEffect } from "react";
import type { RefObject } from "react";

import { createExpandController } from "./expandController";
import { canScrollDown, canScrollUp } from "../a11y/scrollableChain";

interface SheetExpandOptions {
  panelRef: RefObject<HTMLElement | null>;
  active: boolean;
  expandable: boolean;
}

const INTERACTIVE = "input, textarea, select, button, a, [contenteditable]";

/** Continuous upward detent. Finger drags follow and the release decides at
 * the midpoint. Trackpad swipes also follow, but CROSSING the midpoint
 * commits right then (a wheel has no release event — waiting for it to go
 * idle read as a stall), and trailing inertia is swallowed after a commit. */
export function useSheetExpand({ panelRef, active, expandable }: SheetExpandOptions): void {
  useEffect(() => {
    const panel = panelRef.current;
    if (!active || !expandable || !panel) return;

    const detents = createExpandController(panel);
    let startY = 0, startH = 0;
    let tracking = false, dragging = false, swallowing = false;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let quietTimer: ReturnType<typeof setTimeout> | undefined;
    const swallow = () => {
      swallowing = true;
      clearTimeout(quietTimer);
      quietTimer = setTimeout(() => {
        swallowing = false;
      }, 160);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
      detents.resume(); // a deliberate grab picks up mid-settle
      startY = event.clientY;
      startH = detents.heightNow();
      tracking = true;
      dragging = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!tracking || event.buttons === 0) return;
      const dy = event.clientY - startY;
      if (!dragging) {
        if (Math.abs(dy) < 8) return;
        // Downward from the base detent is dismiss territory (pull hook);
        // scrolled content scrolls before any height gesture engages.
        if (dy > 0 && !panel.hasAttribute("data-vx-expanded") && detents.current < 0) return;
        if (dy > 0 && canScrollUp(event.target, panel)) return;
        dragging = true;
        panel.setPointerCapture?.(event.pointerId);
        panel.style.userSelect = "none";
      }
      detents.track(startH - dy);
    };
    const onPointerUp = () => {
      if (dragging) settleIdle();
      tracking = dragging = false;
      panel.style.userSelect = "";
    };
    const settleIdle = () => {
      clearTimeout(wheelTimer);
      detents.settle();
    };
    // Trackpad: fingers up = positive deltaY = grow; fingers down = shrink.
    // (Wheel events never resume a settle — trackpad inertia kept re-grabbing
    // the animation, which stalled it and then snapped.)
    const onWheel = (event: WheelEvent) => {
      if (swallowing) {
        event.preventDefault();
        swallow(); // keep eating the inertia stream until it goes quiet
        return;
      }
      const expanded = panel.hasAttribute("data-vx-expanded");
      if (detents.current < 0) {
        const canGrow =
          !expanded && event.deltaY > 0 && !canScrollDown(event.target, panel);
        const canShrink =
          expanded && event.deltaY < 0 && !canScrollUp(event.target, panel);
        if (!canGrow && !canShrink) return;
      }
      event.preventDefault();
      detents.track(detents.heightNow() + event.deltaY);
      // Crossing the midpoint commits RIGHT THEN; the short idle only
      // resolves gestures released before it.
      const progress = detents.progress();
      if (!expanded && progress >= 0.55) {
        clearTimeout(wheelTimer);
        detents.settle(true);
        swallow();
      } else if (expanded && progress <= 0.45) {
        clearTimeout(wheelTimer);
        detents.settle(false);
        swallow();
      } else {
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(settleIdle, 260);
      }
    };

    panel.addEventListener("pointerdown", onPointerDown);
    panel.addEventListener("pointermove", onPointerMove);
    panel.addEventListener("pointerup", onPointerUp);
    panel.addEventListener("pointercancel", onPointerUp);
    panel.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(wheelTimer);
      clearTimeout(quietTimer);
      detents.dispose();
      panel.removeEventListener("pointerdown", onPointerDown);
      panel.removeEventListener("pointermove", onPointerMove);
      panel.removeEventListener("pointerup", onPointerUp);
      panel.removeEventListener("pointercancel", onPointerUp);
      panel.removeEventListener("wheel", onWheel);
    };
  }, [panelRef, active, expandable]);
}
