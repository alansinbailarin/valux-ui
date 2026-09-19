"use client";

import type { HTMLAttributes } from "react";

export interface HeroProps extends HTMLAttributes<HTMLDivElement> {
  /** Shared identity: the element with the same name on the other side
   * of a transition is where this one flies to. Unique per page. */
  name: string;
}

/** Marks an element as SHARED across a view transition — the SwiftUI
 * matched-geometry idea: same name on both pages, the browser morphs
 * position, size, and content between them. */
export function Hero({ name, style, children, ...props }: HeroProps) {
  return (
    <div {...props} style={{ ...style, viewTransitionName: name }}>
      {children}
    </div>
  );
}
