import { useLayoutEffect } from "react";
import type { RefObject } from "react";

import { adoptTriggerSurface } from "./adoptTriggerSurface";
import type { DialogAlign, DialogPlacement, DialogSide, DialogSize } from "./Dialog.types";
import { resolveDialogPosition } from "./dialogPlacement";
import { populateGhost } from "../a11y/populateGhost";
import type { MorphPhase } from "../morph/useMorph";

interface PositionOptions {
  panelRef: RefObject<HTMLElement | null>;
  ghostRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  phase: MorphPhase;
  placement: DialogPlacement;
  side: DialogSide;
  align: DialogAlign;
  surface: "auto" | "trigger";
  size: DialogSize;
}

/** Positions the panel (and the morph origin) BEFORE useMorph measures:
 * anchored to the trigger, centered, fullscreen, or detached-centered. */
export function useDialogPosition({
  panelRef,
  ghostRef,
  triggerRef,
  phase,
  placement,
  side,
  align,
  surface,
  size,
}: PositionOptions): void {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    // Only cancel in-flight morphs if we are NOT closing.
    // Canceling during a close leaves the phase stuck at "closing" because
    // useMorph won't restart a closing animation on a mere prop update.
    if (phase !== "closing" && typeof panel.getAnimations === "function") {
      for (const animation of panel.getAnimations()) animation.cancel();
    }
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const p = panel.getBoundingClientRect();
    const trigger = triggerRef.current;
    panel.toggleAttribute("data-vx-detached", !trigger);

    if (!trigger || size === "full") {
      // Detached (no trigger): centered, no morph. Full: takes the viewport.
      const full = size === "full";
      panel.style.left = full ? "0" : `${Math.max(16, (viewport.width - p.width) / 2)}px`;
      panel.style.top = full ? "0" : `${Math.max(24, (viewport.height - p.height) / 2)}px`;
      panel.style.transformOrigin = "50% 50%";
    } else {
      const t = trigger.getBoundingClientRect();
      const pos = resolveDialogPosition(
        placement,
        { top: t.top, left: t.left, width: t.width, height: t.height },
        { width: p.width, height: p.height },
        viewport,
        side,
        align,
      );
      panel.style.left = `${pos.left}px`;
      panel.style.top = `${pos.top}px`;
      panel.style.width = pos.width !== undefined ? `${pos.width}px` : "";
      panel.style.transformOrigin = `${pos.originX} ${pos.originY}`;
    }

    if (trigger && surface === "trigger") adoptTriggerSurface(panel, trigger);
    if (trigger && ghostRef.current) populateGhost(ghostRef.current, trigger);
  }, [panelRef, ghostRef, triggerRef, phase, placement, side, align, surface, size]);
}
