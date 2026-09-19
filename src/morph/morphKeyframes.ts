// The OPEN half of the morph, and the entry point both halves are reached
// through. Choreography approved in the visual companion (v9): anticipation
// dip, streak (the body stretches into a line while it travels), overshoot
// past the final size, and a settle — with a round↔rect radius morph and
// motion blur that is sharp at both ends. Color is part of the morph too: the
// body interpolates trigger↔panel background so there is never a color snap.
// The close is its own table now; see closeKeyframes.ts.

import { buildCloseKeyframes } from "./closeKeyframes";
import { DEFAULT_RECT, glassAt, MENU_PRESET, ROUND, tr } from "./morphVocabulary";
import type {
  MenuMorphDirection,
  MorphColors,
  MorphPreset,
  MorphTravel,
} from "./morphVocabulary";

export { CLOSE_HOLD, buildGhostReturnKeyframes } from "./closeKeyframes";
export { DIALOG_PRESET, MENU_PRESET } from "./morphVocabulary";
export type {
  MenuMorphDirection,
  MorphColors,
  MorphPreset,
  MorphTravel,
} from "./morphVocabulary";

const ANTICIPATION = 0.2; // dip: 20% smaller than the trigger
const OVERSHOOT = 0.16; // grows 16% past the panel size

const EASE_IN = "cubic-bezier(.45,0,.55,1)";
const EASE_MID = "cubic-bezier(.35,0,.25,1)";
const EASE_OUT = "cubic-bezier(.2,.75,.3,1)";

export interface MorphKeyframeOptions {
  settleRadius?: string;
  colors?: MorphColors;
  preset?: MorphPreset;
  travel?: MorphTravel;
  /** The surface's settled backdrop-filter: the body travels with the glass
   * OFF (mobile GPUs) and the keyframes fade it in during the settle — CSS
   * transitions never fire when a WAAPI fill is canceled, so the reveal must
   * live INSIDE the animation. */
  glass?: string;
  /** Pre-scale radius rendering as the TRIGGER's radius at the compressed
   * scale ("Hpx / Vpx"). A plain 999px pill deforms under non-uniform scale
   * (squashed corners on landing) and the true circle then pops in. */
  landRadius?: string;
}

export function buildMorphKeyframes(
  direction: MenuMorphDirection,
  bx: number,
  by: number,
  options: MorphKeyframeOptions = {},
): Keyframe[] {
  const { colors, travel, glass } = options;
  const preset = options.preset ?? MENU_PRESET;
  const RECT = options.settleRadius ?? DEFAULT_RECT;
  const LAND = options.landRadius ?? ROUND;
  const BLUR = preset.blur;

  if (direction === "close") {
    return buildCloseKeyframes({
      bx,
      by,
      rect: RECT,
      land: LAND,
      blur: BLUR,
      streak: preset.streak,
      colors,
      travel,
      glass,
    });
  }

  const ax = bx * (1 - ANTICIPATION);
  const ay = by * (1 - ANTICIPATION);
  const streakX = bx + (1 - bx) * preset.streak;
  const streakY = by * 0.8;
  const overshoot = preset.overshoot ?? OVERSHOOT;
  const over = 1 + overshoot;
  const bodyColor = colors?.travel ?? colors?.panel;

  return [
    { offset: 0, transform: `${tr(travel, 1)}scale(${bx},${by})`, borderRadius: LAND, filter: "blur(0px)", ...(colors && { backgroundColor: colors.trigger }), ...glassAt(glass, false), easing: EASE_IN },
    { offset: 0.12, transform: `${tr(travel, 1)}scale(${ax},${ay})`, borderRadius: LAND, filter: `blur(${BLUR * 0.25}px)`, easing: EASE_MID },
    { offset: 0.34, transform: `${tr(travel, 0.55)}scale(${streakX},${streakY})`, borderRadius: ROUND, filter: `blur(${BLUR}px)`, easing: EASE_MID },
    { offset: 0.62, transform: `${tr(travel, 0)}scale(${over},${over})`, borderRadius: RECT, filter: `blur(${BLUR * 0.35}px)`, ...(bodyColor && { backgroundColor: bodyColor }), easing: EASE_OUT },
    { offset: 0.82, transform: `${tr(travel, 0)}scale(${1 + overshoot / 2},${1 + overshoot / 2})`, borderRadius: RECT, filter: `blur(${BLUR * 0.1}px)`, ...glassAt(glass, false), easing: EASE_OUT },
    // The settle IS the glass reveal: background relaxes to the translucent
    // surface while the backdrop blur fades in — no snap when the fill drops.
    { offset: 1, transform: "scale(1,1)", borderRadius: RECT, filter: "blur(0px)", ...(colors && { backgroundColor: colors.panel }), ...glassAt(glass, true) },
  ];
}
