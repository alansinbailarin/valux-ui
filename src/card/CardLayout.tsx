import type { HTMLAttributes } from "react";

import type {
  CardSectionProps,
  CardSeparatorProps,
  CardTitleProps,
} from "./Card.types";

/** Header/Body/Footer share one shape: a div that can opt into a different
 * plane (`surface`) and its own spacing (`padding`). Both map to data
 * attributes so the CSS stays the single source of truth for the values. */
function section(className: string) {
  return function Section({
    surface = "none",
    padding,
    className: extra,
    children,
    ...props
  }: CardSectionProps) {
    return (
      <div
        {...props}
        className={[className, extra].filter(Boolean).join(" ")}
        data-vx-surface={surface}
        data-vx-padding={padding}
      >
        {children}
      </div>
    );
  };
}

/** Groups Title + Subtitle above the body. */
export const CardHeader = section("vx-card__header");

/** Free content region. */
export const CardBody = section("vx-card__body");

/** Action row: right-aligned, kit control gap. */
export const CardFooter = section("vx-card__footer");

/** Hairline divider between sections. `inset="content"` aligns it with the
 * padded content edge (grouped-list look) instead of bleeding to the card
 * edge. Renders an <hr>, so it is an exposed separator for assistive tech
 * without any extra ARIA. */
export function CardSeparator({
  inset = "none",
  className,
  ...props
}: CardSeparatorProps) {
  return (
    <hr
      {...props}
      className={["vx-card__separator", className].filter(Boolean).join(" ")}
      data-vx-inset={inset}
    />
  );
}

/** Semantic heading for the card. Default h3; override with `as`. */
export function CardTitle({
  as: Heading = "h3",
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <Heading
      {...props}
      className={["vx-card__title", className].filter(Boolean).join(" ")}
    >
      {children}
    </Heading>
  );
}

/** Secondary line under the title. */
export function CardSubtitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={["vx-card__subtitle", className].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
