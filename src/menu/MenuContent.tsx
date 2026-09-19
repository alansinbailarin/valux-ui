"use client";

import { createPortal } from "react-dom";

import type { MenuContentProps } from "./Menu.types";
import { MenuContentSurface } from "./MenuContentSurface";
import { useMenuContext } from "./MenuContext";
import { applyPortalTheme, usePortalTheme } from "../a11y/usePortalTheme";
import { usePortalNode } from "../a11y/usePortalNode";

export function MenuContent(props: MenuContentProps) {
  const { phase, triggerRef, themeRef } = useMenuContext();
  const portalNode = usePortalNode(phase !== "closed", (node) =>
    applyPortalTheme(node, themeRef?.current ?? triggerRef.current),
  );
  usePortalTheme(portalNode, themeRef ?? triggerRef);

  if (!portalNode) return null;

  return createPortal(<MenuContentSurface {...props} />, portalNode);
}
