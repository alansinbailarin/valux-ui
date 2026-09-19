"use client";

import { Dialog as DialogRoot } from "./Dialog";
import { DialogClose } from "./DialogClose";
import { DialogContent } from "./DialogContent";
import { DialogDescription } from "./DialogDescription";
import { DialogIcon } from "./DialogIcon";
import { DialogBody, DialogFooter, DialogHeader } from "./DialogLayout";
import { DialogTitle } from "./DialogTitle";
import { DialogTrigger } from "./DialogTrigger";

type DialogComponent = typeof DialogRoot & {
  Trigger: typeof DialogTrigger;
  Content: typeof DialogContent;
  Header: typeof DialogHeader;
  Icon: typeof DialogIcon;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
  Close: typeof DialogClose;
};

const Dialog = DialogRoot as DialogComponent;
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Icon = DialogIcon;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
Dialog.Close = DialogClose;

export { Dialog };
export type { DialogIconProps, DialogIconTone } from "./DialogIcon";
export type {
  DialogAlign,
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogPlacement,
  DialogProps,
  DialogSide,
  DialogSize,
  DialogTitleProps,
  DialogTriggerProps,
} from "./Dialog.types";
