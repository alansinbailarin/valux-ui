"use client";

import { useEffect, useRef } from "react";

/* How hungrily the arrow chases the pointer (fraction of the remaining
   distance per frame) and how fast the tip turns into the travel
   direction. Tuned DOWN on request: at 0.12 the arrow trails the hand by a
   visible beat (~90ms half-distance) instead of gluing to it. Chase > turn,
   so it leans into curves instead of twitching. */
const CHASE = 0.12;
const TURN = 0.09;
/** The tip's coordinates inside the 32x32 viewBox — the point that pins to
 * the (smoothed) pointer position and that the rotation pivots around. */
const TIP_X = 26;
const TIP_Y = 16;

/** The kit's cursor: a rounded arrowhead that replaces the native pointer
 * across the page. Two tiers, both activated by mounting this component
 * ONCE (kit styles alone never touch a consumer's cursor):
 *  - static — data-vx-cursor="static" turns on the CSS `cursor: url(svg)`
 *    tier: OS-composited, zero lag, what reduced-motion and no-fine-pointer
 *    environments keep;
 *  - live — for fine pointers without reduced motion, the native cursor
 *    hides and this element trails the pointer with easing, turning its tip
 *    toward the direction of travel.
 *
 * Zero-flash: server-render data-vx-cursor="static" on <html> yourself.
 * Engine discipline: direct DOM writes (no React state), transform-only
 * animation, and a drive loop that SLEEPS when settled. */
export function Cursor({
  inert,
  className,
  style,
}: {
  inert?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (inert) return;
    const el = ref.current;
    const root = document.documentElement;
    if (!el) return;
    const hadStatic = root.dataset.vxCursor === "static";
    root.dataset.vxCursor = "static"; // enable the CSS tier for everyone
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return () => {
        if (!hadStatic) delete root.dataset.vxCursor;
      };
    }

    root.dataset.vxCursor = "live";
    let raf = 0;
    let isIdle = true;
    // Parked offscreen until the first real move.
    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let angle = 0;

    const step = () => {
      x += (targetX - x) * CHASE;
      y += (targetY - y) * CHASE;
      const dx = targetX - x;
      const dy = targetY - y;
      // Only steer while actually travelling: a parked arrow keeps its
      // last heading instead of snapping to noise.
      if (Math.hypot(dx, dy) > 2) {
        const heading = Math.atan2(dy, dx);
        // Shortest arc, so a 350° turn is read as -10°.
        angle += Math.atan2(Math.sin(heading - angle), Math.cos(heading - angle)) * TURN;
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad) translate(${-TIP_X}px, ${-TIP_Y}px)`;
      if (Math.hypot(targetX - x, targetY - y) < 0.3) {
        isIdle = true;
        return; // settled: the loop sleeps until the next pointermove
      }
      raf = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      el.style.opacity = "1";
      if (isIdle) {
        isIdle = false;
        raf = requestAnimationFrame(step);
      }
    };
    // Dress-change over pressables, event-driven — never per-frame checks.
    const onOver = (event: Event) => {
      const pressable = (event.target as Element).closest?.(
        'a, button, [role="button"], label, summary',
      );
      el.classList.toggle("vx-cursor--press", Boolean(pressable));
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      if (hadStatic) root.dataset.vxCursor = "static";
      else delete root.dataset.vxCursor;
    };
  }, [inert]);

  return (
    <svg
      ref={ref}
      className={["vx-cursor", className].filter(Boolean).join(" ")}
      style={{
        ...style,
        ...(inert && { opacity: 1, position: "relative", pointerEvents: "none", transform: "none" }),
      }}
      aria-hidden="true"
      viewBox="0 0 32 32"
      width="32"
      height="32"
    >
      <path d="M7 7 26 16 7 25 Q11.5 16 7 7 Z" />
    </svg>
  );
}
