import { useEffect } from "react";
import type { RefObject } from "react";

import { prefersReducedMotion } from "../morph/reducedMotion";
import type { MorphPhase } from "../morph/useMorph";

/** Advances opening→open and closing→closed when the panel's CSS slide
 * animation ends (with an instant path for reduced motion and a timeout
 * safety net for environments where animations never run). */
export function useSheetPhase(
  panelRef: RefObject<HTMLElement | null>,
  phase: MorphPhase,
  setPhase: (phase: MorphPhase) => void,
): void {
  useEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const next = phase === "opening" ? "open" : "closed";
    const panel = panelRef.current;

    if (!panel || prefersReducedMotion() || panel.hasAttribute("data-vx-skip-morph")) {
      // With no animation to wait for, the machine must not stall here.
      setPhase(next);
      return;
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target === panel) setPhase(next);
    };
    panel.addEventListener("animationend", onEnd);
    const fallback = setTimeout(() => setPhase(next), 700);
    return () => {
      clearTimeout(fallback);
      panel.removeEventListener("animationend", onEnd);
    };
  }, [panelRef, phase, setPhase]);
}
