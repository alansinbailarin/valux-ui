"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

// One page-wide swallower for the label click that MAY follow a drag
// release (it would undo the drag's decision). iOS often never fires that
// click, so a swallower left armed forever would eat the next tap AND the
// next drag's programmatic commit — it must always disarm: on first
// click, on timeout, and before any new commit.
let disarmSwallower: (() => void) | null = null;

function armSwallower() {
  disarmSwallower?.();
  const swallow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    disarm();
  };
  const disarm = () => {
    document.removeEventListener("click", swallow, { capture: true });
    if (disarmSwallower === disarm) disarmSwallower = null;
  };
  document.addEventListener("click", swallow, { capture: true });
  disarmSwallower = disarm;
  setTimeout(disarm, 350);
}

/** iOS-style thumb dragging: follow the pointer, commit by position on
 * release (past the midpoint = on). A plain tap falls through to the
 * native label/checkbox click. NEVER captures the pointer on touch —
 * WebKit would swallow the click (hard-won kit lesson). */
export function useSwitchDrag(
  trackRef: RefObject<HTMLElement | null>,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onPointerDown = (event: PointerEvent) => {
      const input = inputRef.current;
      if (!input || input.disabled || event.button > 0) return;
      const thumb = track.querySelector<HTMLElement>("[data-vx-thumb]");
      const fill = track.querySelector<HTMLElement>("[data-vx-fill]");
      if (!thumb) return;
      const travel = track.clientWidth - thumb.offsetWidth - thumb.offsetLeft * 2;
      const startX = event.clientX;
      const from = input.checked ? 1 : 0;
      let moved = false;
      let progress = from;

      const onMove = (move: PointerEvent) => {
        const dx = move.clientX - startX;
        if (Math.abs(dx) > 4 && !moved) {
          moved = true;
          // A live drag must never highlight the page around it.
          document.body.style.userSelect = "none";
          document.body.style.webkitUserSelect = "none";
        }
        if (!moved) return;
        progress = Math.min(1, Math.max(0, from + dx / travel));
        track.setAttribute("data-vx-dragging", "");
        thumb.style.transform = `translateX(${progress * travel}px)`;
        if (fill) fill.style.opacity = `${progress}`;
      };
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        track.removeAttribute("data-vx-dragging");
        thumb.style.transform = "";
        if (fill) fill.style.opacity = "";
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        if (!moved) return; // plain tap: the native click handles it
        const desired = progress > 0.5;
        disarmSwallower?.(); // never eat our own programmatic commit
        if (desired !== input.checked) input.click();
        armSwallower();
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    };

    track.addEventListener("pointerdown", onPointerDown);
    return () => track.removeEventListener("pointerdown", onPointerDown);
  }, [trackRef, inputRef]);
}
