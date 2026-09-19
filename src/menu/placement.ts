import type { MenuAlign, MenuSide } from "./Menu.types";

export interface PlacementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ResolvedPlacement {
  left: number;
  top: number;
  side: "top" | "bottom";
  align: "start" | "center" | "end";
}

const MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function resolvePlacement(
  trigger: PlacementRect,
  panel: { width: number; height: number },
  viewport: Viewport,
  side: MenuSide = "auto",
  align: MenuAlign = "auto",
): ResolvedPlacement {
  const belowFits = trigger.top + panel.height <= viewport.height;
  const resolvedSide: "top" | "bottom" =
    side === "top" || side === "bottom" ? side : belowFits ? "bottom" : "top";

  const rightFits = trigger.left + panel.width <= viewport.width;
  const resolvedAlign: "start" | "center" | "end" =
    align === "start" || align === "center" || align === "end"
      ? align
      : rightFits
        ? "start"
        : "end";

  let left =
    resolvedAlign === "start"
      ? trigger.left
      : resolvedAlign === "end"
        ? trigger.left + trigger.width - panel.width
        : trigger.left + trigger.width / 2 - panel.width / 2;
  let top =
    resolvedSide === "bottom"
      ? trigger.top
      : trigger.top + trigger.height - panel.height;

  left = clamp(left, MARGIN, viewport.width - panel.width - MARGIN);
  top = clamp(top, MARGIN, viewport.height - panel.height - MARGIN);

  return { left, top, side: resolvedSide, align: resolvedAlign };
}
