import { flushSync } from "react-dom";

type DocumentWithVT = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/** Runs a React state flip inside a View Transition, scoped by a root
 * attribute so its choreography CSS applies to THIS transition only — the
 * lesson the mode wave taught: view-transition pseudos are global, and an
 * unscoped rule leaks into every future transition on the page.
 *
 * flushSync is load-bearing: the DOM must reflect the new state inside the
 * transition's update callback, or the browser photographs the old page
 * twice. `afterSettled` runs once the transition is over (or immediately on
 * the reduced-motion/no-support path): focus moves belong there — filmed
 * frame by frame, a focus() inside the update callback bakes the focus ring
 * into the live "new" snapshot and parades it across the whole journey. */
export function withExpandTransition(
  update: () => void,
  afterSettled?: () => void,
): void {
  const doc = document as DocumentWithVT;
  const root = document.documentElement;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || typeof doc.startViewTransition !== "function") {
    update();
    afterSettled?.();
    return;
  }
  root.dataset.vxExpand = "";
  const transition = doc.startViewTransition(() => {
    flushSync(update);
  });
  transition.finished.finally(() => {
    delete root.dataset.vxExpand;
    afterSettled?.();
  });
}
