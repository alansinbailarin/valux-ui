import type { TooltipAlign, TooltipSide } from "./Tooltip.types";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
interface Size {
  width: number;
  height: number;
}

const GAP = 8;
const EDGE = 8;

/** Offset placement (the menu's placement OVERLAPS the trigger — it is the
 * morph anchor; a tooltip must sit BESIDE it): preferred side with a gap,
 * flipped when it would overflow, aligned and clamped to the viewport. */
export function resolveTooltipPosition(
  trigger: Rect,
  panel: Size,
  viewport: Size,
  side: TooltipSide = "auto",
  align: TooltipAlign = "auto",
): { left: number; top: number; side: "top" | "bottom" | "left" | "right" } {
  const fitsAbove = trigger.top - panel.height - GAP >= EDGE;
  const fitsBelow =
    trigger.top + trigger.height + panel.height + GAP <= viewport.height - EDGE;
  let resolved: "top" | "bottom" | "left" | "right" =
    side === "auto" ? (fitsAbove || !fitsBelow ? "top" : "bottom") : side;
  if (resolved === "top" && !fitsAbove && fitsBelow) resolved = "bottom";
  else if (resolved === "bottom" && !fitsBelow && fitsAbove) resolved = "top";

  const clamp = (value: number, max: number) =>
    Math.min(Math.max(value, EDGE), Math.max(EDGE, max - EDGE));

  if (resolved === "left" || resolved === "right") {
    const left =
      resolved === "left"
        ? trigger.left - panel.width - GAP
        : trigger.left + trigger.width + GAP;
    const top = trigger.top + (trigger.height - panel.height) / 2;
    return {
      left: clamp(left, viewport.width - panel.width),
      top: clamp(top, viewport.height - panel.height),
      side: resolved,
    };
  }

  const centered = trigger.left + (trigger.width - panel.width) / 2;
  const left =
    align === "start" ? trigger.left
    : align === "end" ? trigger.left + trigger.width - panel.width
    : centered;
  const top =
    resolved === "top"
      ? trigger.top - panel.height - GAP
      : trigger.top + trigger.height + GAP;
  return {
    left: clamp(left, viewport.width - panel.width),
    top: clamp(top, viewport.height - panel.height),
    side: resolved,
  };
}
