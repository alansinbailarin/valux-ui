import { useLayoutEffect } from "react";
import type { RefObject } from "react";

const THEME_ATTRIBUTES = ["data-vx-mode", "data-vx-density"];

/** Mirrors the nearest provider's theme (attributes + inline token overrides)
 * onto a portal node. MUST run before the panel inside measures its colors —
 * call it at portal-node creation (usePortalNode's decorate), or the morph
 * samples the default theme and the surface flashes gray before recoloring. */
export function applyPortalTheme(
  portalNode: HTMLElement,
  trigger: HTMLElement | null | undefined,
): void {
  const provider = trigger?.closest("[data-vx-provider]");
  if (!(provider instanceof HTMLElement)) return;

  portalNode.setAttribute("data-vx-provider", "");
  for (const name of THEME_ATTRIBUTES) {
    // Each attribute resolves from its nearest CARRIER, not the nearest
    // provider: a nested provider that only overrides colors carries no
    // mode, and copying its (missing) mode stripped dark from portaled
    // panels (white-menus-in-dark bug).
    const carrier = trigger?.closest(`[${name}]`);
    const value =
      carrier instanceof HTMLElement ? carrier.getAttribute(name) : null;
    if (value !== null) portalNode.setAttribute(name, value);
    else portalNode.removeAttribute(name);
  }
  portalNode.style.cssText = provider.style.cssText;
}

/** Keeps the portal's theme in sync while open (theme toggles, re-renders).
 * The initial application happens earlier, at node creation. */
export function usePortalTheme(
  portalNode: HTMLElement | null,
  triggerRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    if (!portalNode) return;
    applyPortalTheme(portalNode, triggerRef.current);
  }, [portalNode, triggerRef]);
}
