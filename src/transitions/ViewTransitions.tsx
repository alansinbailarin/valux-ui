"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { pendingNavigation } from "./transitionEngine";

/** Mount ONCE inside the transitioned layout (like Toaster): resolves the
 * in-flight view transition when the new route has committed, so the
 * browser snapshots the finished page — not a loading state. */
export function ViewTransitions() {
  const pathname = usePathname();
  useEffect(() => {
    pendingNavigation.resolve?.();
    pendingNavigation.resolve = null;
  }, [pathname]);
  return null;
}
