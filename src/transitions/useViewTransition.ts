"use client";

import { useCallback } from "react";
import { flushSync } from "react-dom";

import { runViewTransition } from "./transitionEngine";

/** Same-page state morphs — not just navigation: wrap a state update and
 * the UI change animates as a view transition (reorder a list, switch a
 * tab, toggle a layout). Heroes on both sides morph their geometry.
 *
 *   const transition = useViewTransition();
 *   transition(() => setOrder(shuffled));
 */
export function useViewTransition() {
  return useCallback((update: () => void, preset?: string) => {
    // flushSync: the DOM must reflect the new state INSIDE the
    // transition's update callback, or the browser snapshots nothing.
    runViewTransition(() => flushSync(update), preset);
  }, []);
}
