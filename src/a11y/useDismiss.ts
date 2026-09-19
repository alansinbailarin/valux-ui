import { useEffect } from "react";
import type { RefObject } from "react";

export interface DismissOptions {
  active: boolean;
  dismissable: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
}

const LAYER_SELECTOR = [
  '[data-vx-dialog][data-vx-phase="open"]',
  '[data-vx-dialog][data-vx-phase="opening"]',
  '[data-vx-sheet][data-vx-phase="open"]',
  '[data-vx-sheet][data-vx-phase="opening"]',
  '[data-vx-drawer][data-vx-phase="open"]',
  '[data-vx-drawer][data-vx-phase="opening"]',
  '[data-vx-popover][data-vx-phase="open"]',
  '[data-vx-popover][data-vx-phase="opening"]',
  '[data-vx-menu][data-vx-phase="open"]',
  '[data-vx-menu][data-vx-phase="opening"]',
].join(", ");

/** Layers stack (menu in dialog, dialog over dialog): only the TOPMOST open
 * layer may dismiss, so Esc peels one layer at a time and a click inside a
 * nested layer never closes the layers beneath it. Portals append in open
 * order, so the last match in document order is the top of the stack. */
function isTopLayer(panel: HTMLElement): boolean {
  const layers = document.querySelectorAll(LAYER_SELECTOR);
  return layers.length === 0 || layers[layers.length - 1] === panel;
}

export function useDismiss({
  active,
  dismissable,
  panelRef,
  onDismiss,
}: DismissOptions): void {
  useEffect(() => {
    if (!active || !dismissable) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (event.key !== "Escape" || !panel || !isTopLayer(panel)) return;
      onDismiss();
    };
    const onPointerDown = (event: PointerEvent) => {
      const panel = panelRef.current;
      if (!panel || !isTopLayer(panel)) return;
      if (!panel.contains(event.target as Node)) onDismiss();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [active, dismissable, panelRef, onDismiss]);
}
