"use client";

import { useRouter } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { pendingNavigation, runViewTransition } from "./transitionEngine";

export interface TransitionLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Page choreography preset: "hero" (default — shared elements carry
   * the story over a quiet crossfade), "slide", or "fade". Custom preset
   * names work too: they land on <html data-vx-transition> and any CSS
   * you write for them applies. */
  transition?: string;
  /** router.replace instead of push. */
  replace?: boolean;
}

/** A link whose navigation runs inside a View Transition: any <Hero>
 * elements shared with the target page fly to their new home. */
export function TransitionLink({
  href,
  transition,
  replace = false,
  children,
  onClick,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    runViewTransition(
      () =>
        new Promise<void>((resolve) => {
          pendingNavigation.resolve = resolve;
          if (replace) router.replace(href);
          else router.push(href);
        }),
      transition,
    );
  };

  return (
    <a {...props} href={href} onClick={navigate}>
      {children}
    </a>
  );
}
