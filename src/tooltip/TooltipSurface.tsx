"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import type { TooltipContentProps } from "./Tooltip.types";
import { useTooltipContext } from "./TooltipContext";
import { resolveTooltipPosition } from "./tooltipPlacement";
import { useSheetPhase } from "../sheet/useSheetPhase";

export function TooltipSurface({
  side = "top",
  align = "auto",
  className,
  style,
  children,
  ...props
}: TooltipContentProps) {
  const { phase, setPhase, hide, triggerRef, tooltipId } = useTooltipContext();
  const panelRef = useRef<HTMLDivElement>(null);

  // CSS streak in/out animations drive the phase machine. This hook MUST run
  // with the panel mounted — with a null panel it advances phases instantly
  // and the entrance never animates.
  useSheetPhase(panelRef, phase, setPhase);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const t = trigger.getBoundingClientRect();
    // offsetWidth/Height ignore transforms: a re-open mid-exit must NOT
    // measure the shrinking chip (that positioned it low-right, then it
    // snapped into place at the animation's end).
    const pos = resolveTooltipPosition(
      { top: t.top, left: t.left, width: t.width, height: t.height },
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
      side,
      align,
    );
    panel.style.left = `${pos.left}px`;
    panel.style.top = `${pos.top}px`;
    // Direction-aware emergence: origin and travel come from CSS per side.
    panel.setAttribute("data-vx-side", pos.side);
  }, [phase, triggerRef, side, align]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    // Native behavior: any scroll dismisses (the anchor is drifting away).
    const onScroll = () => hide();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [hide]);

  return (
    <div
      {...props}
      ref={panelRef}
      id={tooltipId}
      role="tooltip"
      data-vx-tooltip=""
      data-vx-phase={phase}
      className={["vx-tooltip", className].filter(Boolean).join(" ")}
      style={{ position: "fixed", ...style }}
    >
      {children}
    </div>
  );
}
