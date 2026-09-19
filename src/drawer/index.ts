"use client";

import { Drawer as DrawerRoot } from "./Drawer";
import { DrawerClose } from "./DrawerClose";
import { DrawerContent } from "./DrawerContent";
import {
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./DrawerParts";
import { DrawerTrigger } from "./DrawerTrigger";

type DrawerComponent = typeof DrawerRoot & {
  Trigger: typeof DrawerTrigger;
  Content: typeof DrawerContent;
  Header: typeof DrawerHeader;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
  Close: typeof DrawerClose;
};

const Drawer = DrawerRoot as DrawerComponent;
Drawer.Trigger = DrawerTrigger;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Title = DrawerTitle;
Drawer.Description = DrawerDescription;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;
Drawer.Close = DrawerClose;

export { Drawer };
export type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerProps,
  DrawerSide,
  DrawerSize,
  DrawerTitleProps,
  DrawerTriggerProps,
} from "./Drawer.types";
