import { useEffect } from "react";
import type { RefObject } from "react";

import { markToastLeaving, removeToast } from "./toastStore";
import { prefersReducedMotion } from "../morph/reducedMotion";

/** Horizontal swipe-to-dismiss: the card follows the finger fading out; past
 * the threshold (or on a flick) it slides offscreen and is removed — the
 * gesture IS the exit, the CSS leave animation is skipped. */
export function useToastSwipe(
  cardRef: RefObject<HTMLElement | null>,
  id: number,
  leaving: boolean,
): void {
  useEffect(() => {
    const card = cardRef.current;
    if (!card || leaving) return;
    let startX = 0, lastX = 0, lastT = 0, velocity = 0;
    let dragging = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      startX = lastX = event.clientX;
      lastT = event.timeStamp;
      velocity = 0;
      dragging = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.buttons === 0) return;
      const dx = event.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 10) return;
        dragging = true;
        card.setPointerCapture?.(event.pointerId);
      }
      velocity = (event.clientX - lastX) / (event.timeStamp - lastT || 1);
      lastX = event.clientX;
      lastT = event.timeStamp;
      card.style.transform = `translateX(${dx}px)`;
      card.style.opacity = `${Math.max(0.2, 1 - Math.abs(dx) / 260)}`;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = event.clientX - startX;
      const commit = Math.abs(dx) > 90 || Math.abs(velocity) > 0.55;
      if (!commit) {
        card.style.opacity = "";
        card.style.transform = "";
        if (!prefersReducedMotion() && typeof card.animate === "function" && dx !== 0) {
          card.animate(
            [{ transform: `translateX(${dx}px)` }, { transform: "translateX(0)" }],
            { duration: 240, easing: "cubic-bezier(0.25, 0.8, 0.3, 1)" },
          );
        }
        return;
      }
      card.setAttribute("data-vx-swiped", "");
      if (prefersReducedMotion() || typeof card.animate !== "function") {
        removeToast(id);
        return;
      }
      const exitX = (dx >= 0 ? 1 : -1) * (card.offsetWidth + 48);
      const out = card.animate(
        [
          { transform: `translateX(${dx}px)`, opacity: card.style.opacity || 1 },
          { transform: `translateX(${exitX}px)`, opacity: 0 },
        ],
        { duration: 200, easing: "ease-in", fill: "forwards" },
      );
      out.onfinish = () => {
        markToastLeaving(id);
        removeToast(id);
      };
    };

    card.addEventListener("pointerdown", onPointerDown);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerup", onPointerUp);
    card.addEventListener("pointercancel", onPointerUp);
    return () => {
      card.removeEventListener("pointerdown", onPointerDown);
      card.removeEventListener("pointermove", onPointerMove);
      card.removeEventListener("pointerup", onPointerUp);
      card.removeEventListener("pointercancel", onPointerUp);
    };
  }, [cardRef, id, leaving]);
}
