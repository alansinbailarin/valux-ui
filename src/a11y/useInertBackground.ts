import { useEffect } from "react";

export function useInertBackground(
  portalNode: HTMLElement | null,
  active: boolean,
): void {
  useEffect(() => {
    if (!active || !portalNode) return;

    const siblings = (
      Array.from(document.body.children) as HTMLElement[]
    ).filter(
      (element) => element !== portalNode && !element.hasAttribute("inert"),
    );

    siblings.forEach((element) => {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    });

    return () => {
      siblings.forEach((element) => {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      });
    };
  }, [portalNode, active]);
}
