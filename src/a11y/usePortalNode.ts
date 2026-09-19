import { useLayoutEffect, useRef, useState } from "react";

export function usePortalNode(
  active: boolean,
  /** Runs on the node right after it attaches, BEFORE any children mount —
   * the place to copy theme attributes so first-paint colors are right. */
  decorate?: (node: HTMLElement) => void,
): HTMLElement | null {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const decorateRef = useRef(decorate);

  useLayoutEffect(() => {
    decorateRef.current = decorate;
  }, [decorate]);

  useLayoutEffect(() => {
    if (!active) return;

    const element = document.createElement("div");
    element.setAttribute("data-vx-portal", "");
    document.body.appendChild(element);
    decorateRef.current?.(element);
    // Signal readiness only after the node is attached, so the panel mounts
    // (and measures) against a connected element.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNode(element);

    return () => {
      element.remove();
      setNode(null);
    };
  }, [active]);

  return node;
}
