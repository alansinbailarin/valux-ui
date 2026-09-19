import { useEffect } from "react";
import type { RefObject } from "react";

import { prefersReducedMotion } from "../morph/reducedMotion";
import { playPullExit } from "./pullExit";
import { canScrollUp } from "./scrollableChain";
import { swallowInertia } from "./swallowInertia";

interface PullDismissOptions {
  panelRef: RefObject<HTMLElement | null>;
  active: boolean;
  onDismiss: () => void;
}

const INTERACTIVE = "input, textarea, select, button, a, [contenteditable]";
const SNAP_EASE = "cubic-bezier(0.25, 0.8, 0.3, 1)";

/** Pull an open surface DOWN to dismiss it — finger drag on touch, two-finger
 * swipe (wheel) on trackpads. Pulling back up or stopping short springs it
 * back; passing the threshold (or flicking) closes it. */
export function usePullDismiss({ panelRef, active, onDismiss }: PullDismissOptions): void {
  useEffect(() => {
    const panel = panelRef.current;
    if (!active || !panel) return;
    let startY = 0, lastY = 0, lastT = 0, velocity = 0;
    let dragging = false, wheelOffset = 0, dismissed = false;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;

    const scrim = () =>
      panel.parentElement?.querySelector<HTMLElement>("[data-vx-dialog-scrim], [data-vx-sheet-scrim]");
    const threshold = () =>
      Math.max(80, panel.getBoundingClientRect().height / 3);
    const apply = (dy: number) => {
      panel.style.transform = `translateY(${dy > 0 ? dy : dy * 0.15}px)`;
      const height = panel.getBoundingClientRect().height || 1;
      const scrimEl = scrim();
      if (scrimEl) scrimEl.style.opacity = `${Math.max(0, 1 - Math.max(0, dy) / height)}`;
    };
    const release = (dy: number, v: number) => {
      // Moving back up at release (v < -0.05) always cancels; a flick down
      // (v > 0.6) always closes; otherwise distance decides.
      if ((dy > threshold() && v > -0.05) || v > 0.6) {
        dismissed = true;
        swallowInertia(); // outlives this hook: eats the trailing inertia
        playPullExit(panel, scrim() ?? null, dy, () => {
          panel.setAttribute("data-vx-skip-morph", "");
          onDismiss();
        });
        return;
      }
      scrim()?.style.removeProperty("opacity");
      panel.style.transform = "";
      if (dy > 0 && !prefersReducedMotion() && typeof panel.animate === "function") {
        panel.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }],
          { duration: 260, easing: SNAP_EASE },
        );
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (dismissed || event.button !== 0) return;
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
      startY = lastY = event.clientY;
      lastT = event.timeStamp;
      velocity = 0;
      dragging = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.buttons === 0) return;
      const dy = event.clientY - startY;
      if (!dragging) {
        // While expanded or mid height-gesture, collapsing comes first.
        if (dy < 8 || panel.scrollTop > 0 || panel.hasAttribute("data-vx-expanded") || panel.style.height !== "") return;
        dragging = true;
        panel.setPointerCapture?.(event.pointerId);
      }
      velocity = (event.clientY - lastY) / (event.timeStamp - lastT || 1);
      lastY = event.clientY;
      lastT = event.timeStamp;
      apply(dy);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      release(Math.max(0, event.clientY - startY), velocity);
    };
    // Two-finger trackpad swipe: fingers moving down scroll UP (negative
    // deltaY); at scrollTop 0 that overscroll pulls the surface down.
    const onWheel = (event: WheelEvent) => {
      // Already consumed by another gesture (e.g. the sheet's expand hook
      // collapsing on this very event) — never chain a dismiss onto it.
      if (event.defaultPrevented) return;
      if (dismissed) {
        event.preventDefault();
        return;
      }
      if (panel.hasAttribute("data-vx-expanded") || panel.style.height !== "") return; // collapse first
      const inside = panel.contains(event.target as Node);
      if (wheelOffset === 0 && (event.deltaY >= 0 || (inside && canScrollUp(event.target, panel)))) return;
      event.preventDefault();
      wheelOffset = Math.max(0, wheelOffset - event.deltaY);
      apply(wheelOffset);
      clearTimeout(wheelTimer);
      // Crossing the threshold dismisses right then; idle only decides
      // cancels, so trackpad inertia can never read as a hitch.
      if (wheelOffset > threshold()) {
        const settled = wheelOffset;
        wheelOffset = 0;
        release(settled, 0);
        return;
      }
      const settled = wheelOffset;
      wheelTimer = setTimeout(() => {
        wheelOffset = 0;
        release(settled, 0);
      }, 160);
    };

    panel.addEventListener("pointerdown", onPointerDown);
    panel.addEventListener("pointermove", onPointerMove);
    panel.addEventListener("pointerup", onPointerUp);
    panel.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      clearTimeout(wheelTimer);
      panel.removeEventListener("pointerdown", onPointerDown);
      panel.removeEventListener("pointermove", onPointerMove);
      panel.removeEventListener("pointerup", onPointerUp);
      panel.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("wheel", onWheel);
    };
  }, [panelRef, active, onDismiss]);
}
