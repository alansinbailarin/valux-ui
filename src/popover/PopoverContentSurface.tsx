"use client";

import { useLayoutEffect, useRef } from "react";

import type { PopoverContentProps } from "./Popover.types";
import { usePopoverContext } from "./PopoverContext";
import { useDismiss } from "../a11y/useDismiss";
import { useMenuPosition } from "../menu/useMenuPosition";
import { useCloseScrub } from "../morph/useCloseScrub";
import { useMorph } from "../morph/useMorph";

export function PopoverContentSurface({
  children,
  side = "auto",
  align = "auto",
  surface = "auto",
  dismissable = true,
  className,
  style,
  ...props
}: PopoverContentProps) {
  const { phase, setOpen, setPhase, triggerRef, popoverId } = usePopoverContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const active = phase === "opening" || phase === "open";

  // Shares the Menu's collision-aware placement, morph origin, and
  // surface-adoption machinery (the popover panel reads the same tokens).
  useMenuPosition({ panelRef, ghostRef, triggerRef, phase, side, align, surface });

  useMorph({
    phase,
    panelRef,
    triggerRef,
    ghostRef,
    onOpened: () => setPhase("open"),
    onClosed: () => setPhase("closed"),
  });
  useDismiss({ active, dismissable, panelRef, onDismiss: () => setOpen(false) });
  useCloseScrub({
    panelRef,
    triggerRef,
    active: phase === "open" && dismissable,
    onDismiss: () => setOpen(false),
  });

  // Non-modal: no trap/lock/inert. Focus moves to the first tabbable on
  // open and returns to the trigger when the popover leaves the tree.
  useLayoutEffect(() => {
    if (phase === "open") {
      panelRef.current
        ?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    }
  }, [phase]);
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [triggerRef]);

  return (
    <div
      {...props}
      ref={panelRef}
      id={popoverId}
      role="dialog"
      aria-labelledby={`${popoverId}-trigger`}
      data-vx-popover=""
      data-vx-phase={phase}
      className={["vx-popover", className].filter(Boolean).join(" ")}
      style={{ position: "fixed", ...style }}
    >
      {children}
      {phase === "closing" ? (
        <div aria-hidden="true" className="vx-popover-ghost">
          <span ref={ghostRef} className="vx-popover-ghost__inner" />
        </div>
      ) : null}
    </div>
  );
}
