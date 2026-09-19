import { prefersReducedMotion } from "../morph/reducedMotion";

/** Plays the gesture-owned exit for a pulled-down surface: the panel slides
 * offscreen from the release point while the scrim fades from its dragged
 * dimness. WAAPI on purpose — var()-in-keyframes fallbacks made iOS snap the
 * scrim back to full darkness before fading. */
export function playPullExit(
  panel: HTMLElement,
  scrimEl: HTMLElement | null,
  dy: number,
  onDone: () => void,
): void {
  if (prefersReducedMotion() || typeof panel.animate !== "function") {
    onDone();
    return;
  }
  scrimEl?.animate([{ opacity: scrimEl.style.opacity || "1" }, { opacity: "0" }], {
    duration: 220,
    easing: "ease-out",
    fill: "forwards",
  });
  const drop = panel.getBoundingClientRect().height + 32;
  const out = panel.animate(
    [{ transform: `translateY(${dy}px)` }, { transform: `translateY(${drop}px)` }],
    { duration: 240, easing: "ease-in", fill: "forwards" },
  );
  out.onfinish = onDone;
}

/** Sideways twin of playPullExit for edge drawers: slides fully past the
 * screen edge in the dismiss direction. */
export function playPullExitSide(
  panel: HTMLElement,
  scrimEl: HTMLElement | null,
  dx: number,
  sign: 1 | -1,
  onDone: () => void,
): void {
  if (prefersReducedMotion() || typeof panel.animate !== "function") {
    onDone();
    return;
  }
  scrimEl?.animate([{ opacity: scrimEl.style.opacity || "1" }, { opacity: "0" }], {
    duration: 220,
    easing: "ease-out",
    fill: "forwards",
  });
  const drop = (panel.getBoundingClientRect().width + 32) * sign;
  const out = panel.animate(
    [{ transform: `translateX(${dx}px)` }, { transform: `translateX(${drop}px)` }],
    { duration: 240, easing: "ease-in", fill: "forwards" },
  );
  out.onfinish = onDone;
}
