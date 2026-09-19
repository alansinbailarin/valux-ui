"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

import { playPullExitSide } from "./pullExit";
import { swallowInertia } from "./swallowInertia";
import { prefersReducedMotion } from "../morph/reducedMotion";

const INTERACTIVE = "input, textarea, select, button, a, [contenteditable]";
const SNAP_EASE = "cubic-bezier(0.25, 0.8, 0.3, 1)";

/** The Sheet's pull-to-dismiss, rotated 90°: drag the drawer TOWARD its
 * edge (touch) or two-finger swipe sideways (trackpad wheel deltaX). */
export function usePullDismissSide({
  panelRef,
  side,
  active,
  onDismiss,
}: {
  panelRef: RefObject<HTMLElement | null>;
  side: "left" | "right";
  active: boolean;
  onDismiss: () => void;
}): void {
  useEffect(() => {
    const panel = panelRef.current;
    if (!active || !panel) return;
    const sign = side === "right" ? 1 : -1; // dismiss direction on X
    let startX = 0, lastX = 0, lastT = 0, velocity = 0;
    let dragging = false, wheelOffset = 0, dismissed = false;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;

    const scrim = () =>
      panel.parentElement?.querySelector<HTMLElement>("[data-vx-drawer-scrim]");
    const threshold = () => Math.max(70, panel.getBoundingClientRect().width / 3);
    const apply = (dx: number) => {
      const out = dx * sign > 0 ? dx : dx * 0.15; // resist the wrong way
      panel.style.transform = `translateX(${out}px)`;
      const width = panel.getBoundingClientRect().width || 1;
      const scrimEl = scrim();
      if (scrimEl) scrimEl.style.opacity = `${Math.max(0, 1 - Math.max(0, dx * sign) / width)}`;
    };
    const release = (dx: number, v: number) => {
      const toward = dx * sign;
      if ((toward > threshold() && v * sign > -0.05) || v * sign > 0.6) {
        dismissed = true;
        swallowInertia();
        playPullExitSide(panel, scrim() ?? null, dx, sign, () => {
          panel.setAttribute("data-vx-skip-morph", "");
          onDismiss();
        });
        return;
      }
      scrim()?.style.removeProperty("opacity");
      panel.style.transform = "";
      if (toward > 0 && !prefersReducedMotion() && typeof panel.animate === "function") {
        panel.animate(
          [{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }],
          { duration: 260, easing: SNAP_EASE },
        );
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (dismissed || event.button !== 0) return;
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
      startX = lastX = event.clientX;
      lastT = event.timeStamp;
      velocity = 0;
      dragging = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.buttons === 0) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (dx * sign < 8) return; // only claim motion toward the edge
        dragging = true;
      }
      velocity = (event.clientX - lastX) / (event.timeStamp - lastT || 1);
      lastX = event.clientX;
      lastT = event.timeStamp;
      apply(dx);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      release(event.clientX - startX, velocity);
    };
    // Two-finger horizontal swipe: overscroll toward the drawer's edge.
    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented) return;
      if (dismissed) {
        event.preventDefault();
        return;
      }
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return; // vertical scroll wins
      const toward = event.deltaX * -sign; // fingers move WITH the drawer
      if (wheelOffset === 0 && toward <= 0) return;
      event.preventDefault();
      wheelOffset = Math.max(0, wheelOffset + toward);
      apply(wheelOffset * sign);
      clearTimeout(wheelTimer);
      const settle = () => {
        const settled = wheelOffset * sign;
        wheelOffset = 0;
        release(settled, 0);
      };
      // Crossing the threshold dismisses right then; idle only cancels.
      if (wheelOffset > threshold()) settle();
      else wheelTimer = setTimeout(settle, 160);
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
  }, [panelRef, side, active, onDismiss]);
}
