"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

/* Real movement starts past this; anything shorter is a click. */
const DRAG_MIN = 4;
/* The kit's springy settle — the same curve the menu items bounce on. */
const RETURN_EASE = "cubic-bezier(0.22, 1.5, 0.36, 1)";

/** The canvas toy: grab the specimen, drag it anywhere, let go — it springs
 * home. Kit drag discipline throughout: pointer capture so the gesture
 * survives leaving the element, touch-action none so iOS can't cancel it as
 * a scroll, direct transform writes (no React state), and a click that
 * follows a real drag is swallowed so releasing over the component doesn't
 * activate it. Reduced motion snaps home instead of springing. */
export function DraggableSpecimen({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useRef({ x: 0, y: 0, startX: 0, startY: 0, dragging: false, dragged: false });

  const onPointerDown = (event: React.PointerEvent) => {
    const el = ref.current;
    if (!el || state.current.dragging) return; // multi-touch: first wins
    el.getAnimations().forEach((animation) => animation.cancel());
    state.current = { x: 0, y: 0, startX: event.clientX, startY: event.clientY, dragging: true, dragged: false };
    // Capture DELIBERATELY deferred: capturing here retargets the eventual
    // click to this wrapper, so a plain tap never reaches the specimen —
    // the Switch inside stopped toggling. Ownership is claimed only once
    // movement proves drag intent.
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const el = ref.current;
    const s = state.current;
    if (!el || !s.dragging) return;
    s.x = event.clientX - s.startX;
    s.y = event.clientY - s.startY;
    if (!s.dragged && Math.hypot(s.x, s.y) > DRAG_MIN) {
      s.dragged = true;
      el.setPointerCapture(event.pointerId);
    }
    if (s.dragged) el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
  };

  const settle = () => {
    const el = ref.current;
    const s = state.current;
    if (!el || !s.dragging) return;
    s.dragging = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || !s.dragged) {
      el.style.transform = "";
      return;
    }
    el.animate(
      { transform: [`translate3d(${s.x}px, ${s.y}px, 0)`, "translate3d(0, 0, 0)"] },
      { duration: 550, easing: RETURN_EASE },
    );
    el.style.transform = "";
  };

  return (
    <span
      ref={ref}
      className="expand__toy"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={settle}
      onPointerCancel={settle}
      onClickCapture={(event) => {
        // A release at the end of a real drag is not a click on the specimen.
        if (state.current.dragged) {
          event.preventDefault();
          event.stopPropagation();
          state.current.dragged = false;
        }
      }}
    >
      {children}
    </span>
  );
}
