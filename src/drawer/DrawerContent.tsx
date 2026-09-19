"use client";

import { createPortal } from "react-dom";

import type { DrawerContentProps } from "./Drawer.types";
import { DrawerClose } from "./DrawerClose";
import { DrawerContentSurface } from "./DrawerContentSurface";
import { useDrawerContext } from "./DrawerContext";
import { usePortalNode } from "../a11y/usePortalNode";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";

export function DrawerContent({
  closeLabel = "Close",
  children,
  ...props
}: DrawerContentProps) {
  const { phase, triggerRef } = useDrawerContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, triggerRef.current),
  );
  usePortalTheme(portalNode, triggerRef);

  if (!portalNode) return null;

  return createPortal(
    <div data-vx-drawer-root="" data-vx-phase={phase}>
      <div data-vx-drawer-scrim="" data-vx-phase={phase} />
      <DrawerContentSurface portalNode={portalNode} {...props}>
        {children}
        <DrawerClose className="vx-drawer__x" aria-label={closeLabel}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path
              d="M4 4l8 8m0-8l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </DrawerClose>
      </DrawerContentSurface>
    </div>,
    portalNode,
  );
}
