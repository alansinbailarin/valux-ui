import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { MorphPhase } from "../morph/useMorph";
import type { MorphPreset } from "../morph/morphKeyframes";

export interface MenuContextValue {
  open: boolean;
  phase: MorphPhase;
  setOpen: (open: boolean) => void;
  setPhase: (phase: MorphPhase) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  themeRef?: MutableRefObject<HTMLElement | null>;
  menuId: string;
  /** Optional morph personality override (the ContextMenu blooms from a
   * point and uses a crisper preset). */
  preset?: MorphPreset;
  /** No landing trigger: the return must carry its content INTO the point
   * (the usual ghost handoff has nothing to reveal). */
  pointBloom?: boolean;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(): MenuContextValue {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("Menu parts must be used within <Menu>.");
  }

  return context;
}
