import { useLayoutEffect } from "react";
import type { RefObject } from "react";

import type { MenuAlign, MenuSide } from "./Menu.types";
import { resolvePlacement } from "./placement";
import { populateGhost } from "../a11y/populateGhost";
import type { MorphPhase } from "../morph/useMorph";

interface MenuPositionOptions {
  panelRef: RefObject<HTMLElement | null>;
  ghostRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  phase: MorphPhase;
  side: MenuSide;
  align: MenuAlign;
  surface: "auto" | "trigger";
}

/** Collision-aware placement + morph origin, applied BEFORE useMorph measures.
 * Call ahead of useMorph so this layout effect runs first. */
export function useMenuPosition({
  panelRef,
  ghostRef,
  triggerRef,
  phase,
  side,
  align,
  surface,
}: MenuPositionOptions): void {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;

    // Reset any in-flight morph so the panel reports its natural content size.
    if (typeof panel.getAnimations === "function") {
      for (const animation of panel.getAnimations()) animation.cancel();
    }

    const t = trigger.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const placement = resolvePlacement(
      { top: t.top, left: t.left, width: t.width, height: t.height },
      { width: p.width, height: p.height },
      { width: window.innerWidth, height: window.innerHeight },
      side,
      align,
    );
    panel.style.left = `${placement.left}px`;
    panel.style.top = `${placement.top}px`;

    // Color continuity: adopt the trigger's solid colors on request.
    if (surface === "trigger") {
      const triggerStyle = getComputedStyle(trigger);
      // Prefer the Button's RESTING background token: sampling backgroundColor
      // at click time captures the :hover shade (brighter) instead.
      const background =
        triggerStyle.getPropertyValue("--vx-button-background").trim() ||
        triggerStyle.backgroundColor;
      if (background && !/rgba?\(0, 0, 0, 0\)|transparent/.test(background)) {
        // Solid trigger color, breathing the theme primary like every menu.
        panel.style.setProperty(
          "--vx-menu-surface",
          `color-mix(in srgb, var(--vx-color-primary) 6%, ${background})`,
        );
        panel.style.color = triggerStyle.color;
        panel.style.setProperty(
          "--vx-menu-item-hover",
          `color-mix(in srgb, ${triggerStyle.color}, transparent 92%)`,
        );
      }
    }
    // The morph must grow out of the trigger's corner of the panel.
    const originX =
      placement.align === "end" ? "100%" : placement.align === "center" ? "50%" : "0%";
    const originY = placement.side === "top" ? "100%" : "0%";
    panel.style.transformOrigin = `${originX} ${originY}`;
    panel.setAttribute("data-vx-side", placement.side);
    panel.setAttribute("data-vx-align", placement.align);

    // Ghost of the trigger content: travels inside the closing body.
    if (ghostRef.current) populateGhost(ghostRef.current, trigger);
  }, [panelRef, ghostRef, triggerRef, phase, side, align, surface]);
}
