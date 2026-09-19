"use client";

import { useLayoutEffect, useRef } from "react";

import type { DialogContentProps } from "./Dialog.types";
import { useDialogContext } from "./DialogContext";
import { useDialogAria } from "./useDialogAria";
import { useDialogPosition } from "./useDialogPosition";
import { useDismiss } from "../a11y/useDismiss";
import { useFocusTrap } from "../a11y/useFocusTrap";
import { useInertBackground } from "../a11y/useInertBackground";
import { useScrollLock } from "../a11y/useScrollLock";
import { DIALOG_PRESET } from "../morph/morphKeyframes";
import { useCloseScrub } from "../morph/useCloseScrub";
import { useMorph } from "../morph/useMorph";

interface SurfaceProps extends DialogContentProps {
  portalNode: HTMLElement;
}

export function DialogContentSurface({
  portalNode,
  children,
  placement = "trigger",
  side = "auto",
  align = "auto",
  dismissable = true,
  surface = "auto",
  size = "md",
  alert = false,
  initialFocus,
  className,
  style,
  ...props
}: SurfaceProps) {
  const { phase, setOpen, setPhase, triggerRef, dialogId } = useDialogContext();
  const panelRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const active = phase === "opening" || phase === "open";

  useDialogPosition({
    panelRef,
    ghostRef,
    triggerRef,
    phase,
    placement,
    side,
    align,
    surface,
    size,
  });

  // Restore focus to the trigger once the dialog leaves the tree.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [triggerRef]);

  // Fullscreen panels must land exactly at scale 1 — any overshoot visibly
  // grows the content past its final size before settling.
  const preset = size === "full" ? { ...DIALOG_PRESET, overshoot: 0 } : DIALOG_PRESET;
  useMorph({
    phase,
    panelRef,
    triggerRef,
    ghostRef,
    preset,
    onOpened: () => setPhase("open"),
    onClosed: () => setPhase("closed"),
  });
  useDialogAria(panelRef, dialogId, phase);
  useDismiss({ active, dismissable, panelRef, onDismiss: () => setOpen(false) });
  useCloseScrub({
    panelRef,
    triggerRef,
    preset,
    active: phase === "open" && dismissable,
    onDismiss: () => setOpen(false),
  });
  useScrollLock(active);
  useInertBackground(portalNode, active);
  useFocusTrap(panelRef, phase === "open", initialFocus);

  return (
    <div
      {...props}
      ref={panelRef}
      id={dialogId}
      role={alert ? "alertdialog" : "dialog"}
      aria-modal="true"
      data-vx-dialog=""
      data-vx-phase={phase}
      data-vx-placement={placement}
      data-vx-size={size}
      className={["vx-dialog", className].filter(Boolean).join(" ")}
      style={{ position: "fixed", ...style }}
    >
      {children}
      {phase === "closing" ? (
        <div aria-hidden="true" className="vx-dialog-ghost">
          <span ref={ghostRef} className="vx-dialog-ghost__inner" />
        </div>
      ) : null}
    </div>
  );
}
