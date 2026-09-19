import type { Specimen } from "./specimens";
import { CONTROL_SPECIMENS } from "./specimens";
import { OVERLAY_SPECIMENS } from "./specimensOverlays";
import { SYSTEM_SPECIMENS } from "./specimensSystem";

/* The wall's running order: sizes interleaved by hand so the masonry stays
 * staggered without a single empty tile. Every component in the kit is
 * here — the wall IS the catalogue. */
const ORDER = [
  "button", "radio", "dialog", "input", "tooltip", "card", "switch",
  "select", "sheet", "checkbox", "textarea", "drawer", "menu",
  "contextmenu", "modeorb", "popover", "toast", "cursor",
];

const byId = new Map(
  [...CONTROL_SPECIMENS, ...OVERLAY_SPECIMENS, ...SYSTEM_SPECIMENS].map((spec) => [spec.id, spec]),
);

export const SPECIMENS: Specimen[] = ORDER.map((id) => {
  const spec = byId.get(id);
  if (!spec) throw new Error(`specimen faltante: ${id}`);
  return spec;
});
