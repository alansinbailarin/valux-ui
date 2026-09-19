"use client";

import { Menu as MenuRoot } from "./Menu";
import { MenuContent } from "./MenuContent";
import { MenuItem } from "./MenuItem";
import { MenuLabel } from "./MenuLabel";
import { MenuSeparator } from "./MenuSeparator";
import { MenuTrigger } from "./MenuTrigger";

type MenuComponent = typeof MenuRoot & {
  Trigger: typeof MenuTrigger;
  Content: typeof MenuContent;
  Item: typeof MenuItem;
  Separator: typeof MenuSeparator;
  Label: typeof MenuLabel;
};

const Menu = MenuRoot as MenuComponent;
Menu.Trigger = MenuTrigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
Menu.Label = MenuLabel;

export { Menu };
export type { MenuLabelProps } from "./MenuLabel";
export type { MenuSeparatorProps } from "./MenuSeparator";
export type {
  MenuAlign,
  MenuContentProps,
  MenuItemProps,
  MenuProps,
  MenuSide,
  MenuTriggerProps,
} from "./Menu.types";
