import { buildMorphKeyframes, MENU_PRESET } from "./morphKeyframes";
import type {
  MenuMorphDirection,
  MorphColors,
  MorphPreset,
  MorphTravel,
} from "./morphKeyframes";
import { compositeBackground, compositeOver } from "./compositeBackground";

export interface MorphPlan {
  keyframes: Keyframe[];
  duration: number;
  bx: number;
  by: number;
}

/** Measures panel vs trigger (scale, visual colors, travel, settle radius)
 * and builds the keyframes for one morph direction. Shared by the phase
 * machine (runMorph) and the gesture scrubber. */
export function planMorph(
  panel: HTMLElement,
  trigger: HTMLElement,
  direction: MenuMorphDirection,
  preset: MorphPreset = MENU_PRESET,
): MorphPlan {
  const triggerRect = trigger.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const bx = panelRect.width === 0 ? 1 : triggerRect.width / panelRect.width;
  const by = panelRect.height === 0 ? 1 : triggerRect.height / panelRect.height;
  // Settle at the panel's themed radius (follows --vx-radius-control).
  const panelStyle = getComputedStyle(panel);
  const settleRadius = panelStyle.borderRadius || undefined;

  // Color continuity: interpolate the body's background trigger<->panel.
  // The trigger's VISUAL color is composited over its ancestors (soft/outline
  // buttons have translucent backgrounds), which also sidesteps the :hover
  // shade problem of sampling backgroundColor at click time.
  const triggerColor = trigger.hasAttribute("data-vx-context-anchor") ? null : compositeBackground(trigger);
  const panelColor = panelStyle.backgroundColor;
  const transparent = /rgba?\(0, 0, 0, 0\)|transparent/;
  // Opaque travel tone: the panel's glass composited over the page color
  // AROUND the trigger (its parent chain) — NOT over document.body, whose
  // background may differ wildly from the themed surface the panel covers.
  const pageBehind = trigger.parentElement
    ? compositeBackground(trigger.parentElement)
    : null;
  const colors: MorphColors | undefined =
    triggerColor && panelColor && !transparent.test(panelColor)
      ? {
          trigger: triggerColor,
          panel: panelColor,
          travel: (pageBehind && compositeOver(panelColor, pageBehind)) ?? undefined,
        }
      : undefined;

  // Travel: how far the compressed body must shift so it sits ON the trigger.
  // With transform-origin O, scaling moves the panel's top-left to (1-s)·O, so
  // the translate compensates for both the distance and the origin drift.
  // Panels placed at their trigger (menu, dialog placement="trigger") resolve
  // to ~0 and keep their pure-scale keyframes.
  const originParts = panelStyle.transformOrigin.split(" ");
  const originFor = (part: string | undefined, size: number): number => {
    const value = Number.parseFloat(part ?? "") || 0;
    return part?.endsWith("%") ? (value / 100) * size : value;
  };
  const originX = originFor(originParts[0], panelRect.width);
  const originY = originFor(originParts[1], panelRect.height);
  const rawX = triggerRect.left - panelRect.left - (1 - bx) * originX;
  const rawY = triggerRect.top - panelRect.top - (1 - by) * originY;
  const travel: MorphTravel | undefined =
    Math.abs(rawX) > 1 || Math.abs(rawY) > 1
      ? { x: Math.round(rawX), y: Math.round(rawY) }
      : undefined;

  const glass =
    panelStyle.getPropertyValue("--vx-dialog-backdrop").trim() ||
    panelStyle.getPropertyValue("--vx-menu-backdrop").trim() ||
    undefined;

  // Landing radius: the compressed body must RENDER with the trigger's
  // rounding. A fixed pill radius deforms under non-uniform scale (squashed
  // corners), so pre-divide per axis with the H/V border-radius syntax.
  const parsedR = Number.parseFloat(getComputedStyle(trigger).borderRadius);
  const effectiveR = Number.isNaN(parsedR)
    ? Math.min(triggerRect.width, triggerRect.height) / 2
    : Math.min(parsedR, triggerRect.width / 2, triggerRect.height / 2);
  const landRadius =
    bx > 0 && by > 0
      ? `${Math.round(effectiveR / bx)}px / ${Math.round(effectiveR / by)}px`
      : undefined;

  // Touch devices: shorter and with a lighter streak blur — big blur kernels
  // are what drop frames on mobile GPUs, and taps expect drier responses.
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const tuned = coarse
    ? {
        ...preset,
        blur: Math.round(preset.blur * 0.6),
        openMs: Math.round(preset.openMs * 0.88),
        closeMs: Math.round(preset.closeMs * 0.88),
      }
    : preset;

  return {
    keyframes: buildMorphKeyframes(direction, bx, by, {
      settleRadius,
      colors,
      preset: tuned,
      travel,
      glass,
      landRadius,
    }),
    duration: direction === "open" ? tuned.openMs : tuned.closeMs,
    bx,
    by,
  };
}
