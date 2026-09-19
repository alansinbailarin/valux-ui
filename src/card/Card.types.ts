import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

export type CardVariant = "outline" | "elevated" | "soft";

/** Spacing preset. "none" zeroes --vx-card-padding/--vx-card-gap for the
 * element (and, on the root, for every part inside it). Card.Media always
 * bleeds to the card edges regardless. */
export type CardPadding = "default" | "none";

/** Which plane a section sits on. "subtle" lifts it off the card's own
 * surface — the iOS grouped-settings look for a header or footer. */
export type CardSectionSurface = "none" | "subtle";

/** Where a separator starts and ends. "content" aligns it with the padded
 * content edge; "none" bleeds it to the card edge. */
export type CardSeparatorInset = "none" | "content";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Surface look. Default "outline". */
  variant?: CardVariant;
  /** Spacing for the card and every part inside it. Default "default". */
  padding?: CardPadding;
}

/** Shared props for the Header/Body/Footer sections. */
export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Plane this section sits on. Default "none" (the card's own surface). */
  surface?: CardSectionSurface;
  /** Spacing for this section only. Default inherits the card's. */
  padding?: CardPadding;
}

export interface CardSeparatorProps extends HTMLAttributes<HTMLHRElement> {
  /** Inset. Default "none" (edge to edge). */
  inset?: CardSeparatorInset;
}

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** Shortcut: renders an <img> cover. Omit to use free children only. */
  src?: string;
  /** Required for meaning when src is set; defaults to decorative "". */
  alt?: string;
  /** Reserved aspect ratio (avoids layout shift). Default 16/9. */
  ratio?: number;
  /** Optional native <img> props passthrough for the shortcut image. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
  /** Overlaid content (App Store text-over-cover). */
  children?: ReactNode;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level. Default "h3". */
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
}
