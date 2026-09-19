"use client";

import { ContextMenu as ContextMenuRoot } from "./ContextMenu";
import { ContextMenuTrigger } from "./ContextMenuTrigger";
import { MenuContent } from "../menu/MenuContent";
import { MenuItem } from "../menu/MenuItem";
import { MenuLabel } from "../menu/MenuLabel";
import { MenuSeparator } from "../menu/MenuSeparator";

/** Compound ContextMenu: the Menu summoned at the pointer. Content and
 * items ARE the Menu's — same look, keyboard, and gestures. */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
});

export type { ContextMenuProps } from "./ContextMenu";
