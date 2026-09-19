import type { DialogAlign, DialogPlacement, DialogSide } from "./Dialog.types";
import { resolvePlacement } from "../menu/placement";

export interface DialogPosition {
  left: number;
  top: number;
  width?: number;
  originX: string;
  originY: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Where the panel lands and where its morph originates (pointing back at the
 * trigger, so the body visually grows out of / returns into it). */
export function resolveDialogPosition(
  placement: DialogPlacement,
  trigger: Rect,
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  side: DialogSide = "auto",
  align: DialogAlign = "auto",
): DialogPosition {
  if (placement === "center") {
    const left = Math.max(16, (viewport.width - panel.width) / 2);
    const top = Math.max(24, (viewport.height - panel.height) / 2);
    return {
      left,
      top,
      originX: originRatio(trigger.left + trigger.width / 2, left, panel.width),
      originY: originRatio(trigger.top + trigger.height / 2, top, panel.height),
    };
  }

  const resolved = resolvePlacement(trigger, panel, viewport, side, align);
  return {
    left: resolved.left,
    top: resolved.top,
    originX:
      resolved.align === "end" ? "100%" : resolved.align === "center" ? "50%" : "0%",
    originY: resolved.side === "top" ? "100%" : "0%",
  };
}

function originRatio(point: number, start: number, size: number): string {
  const ratio = size === 0 ? 0 : Math.min(1, Math.max(0, (point - start) / size));
  return `${Math.round(ratio * 100)}%`;
}
