"use client";

import { Sheet as SheetRoot } from "./Sheet";
import { SheetClose } from "./SheetClose";
import { SheetContent } from "./SheetContent";
import { SheetBody, SheetFooter, SheetHeader } from "./SheetLayout";
import { SheetTitle, SheetDescription } from "./SheetTitle";
import { SheetTrigger } from "./SheetTrigger";

type SheetComponent = typeof SheetRoot & {
  Trigger: typeof SheetTrigger;
  Content: typeof SheetContent;
  Header: typeof SheetHeader;
  Title: typeof SheetTitle;
  Description: typeof SheetDescription;
  Body: typeof SheetBody;
  Footer: typeof SheetFooter;
  Close: typeof SheetClose;
};

const Sheet = SheetRoot as SheetComponent;
Sheet.Trigger = SheetTrigger;
Sheet.Content = SheetContent;
Sheet.Header = SheetHeader;
Sheet.Title = SheetTitle;
Sheet.Description = SheetDescription;
Sheet.Body = SheetBody;
Sheet.Footer = SheetFooter;
Sheet.Close = SheetClose;

export { Sheet };
export type {
  SheetCloseProps,
  SheetContentProps,
  SheetDescriptionProps,
  SheetHeight,
  SheetProps,
  SheetTitleProps,
  SheetTriggerProps,
} from "./Sheet.types";
