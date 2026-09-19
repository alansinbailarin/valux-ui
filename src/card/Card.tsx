import { forwardRef } from "react";

import type { CardProps } from "./Card.types";

/** Composable surface: bordered by default, with elevated and soft looks.
 * Every anatomy part (Media/Header/Body/Footer/Separator) is optional.
 * The --vx-card-* tokens are public: set them in `style` here and they
 * cascade into every part. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "outline", padding = "default", className, children, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={["vx-card", className].filter(Boolean).join(" ")}
      data-vx-card=""
      data-vx-variant={variant}
      data-vx-padding={padding}
    >
      {children}
    </div>
  );
});
