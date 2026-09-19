import { useLayoutEffect } from "react";
import type { RefObject } from "react";

import { runMorph } from "./runMorph";
import type { MorphPreset } from "./morphKeyframes";

export type MorphPhase = "closed" | "opening" | "open" | "closing";

export interface UseMorphOptions {
  phase: MorphPhase;
  panelRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  ghostRef?: RefObject<HTMLElement | null>;
  preset?: MorphPreset;
  onOpened: () => void;
  onClosed: () => void;
}

export function useMorph({
  phase,
  panelRef,
  triggerRef,
  ghostRef,
  preset,
  onOpened,
  onClosed,
}: UseMorphOptions): void {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (phase === "opening") {
      runMorph({
        panel,
        trigger: triggerRef.current,
        direction: "open",
        preset,
        onFinish: onOpened,
      });
    } else if (phase === "closing") {
      runMorph({
        panel,
        trigger: triggerRef.current,
        ghost: ghostRef?.current ?? null,
        direction: "close",
        preset,
        onFinish: onClosed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
}
