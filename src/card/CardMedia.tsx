import type { CardMediaProps } from "./Card.types";

/** Cover area. `src` renders an <img>; children overlay the media
 * (App Store text-over-cover). Reserves aspect ratio to avoid layout
 * shift; clips to the card radius via the card's overflow. */
export function CardMedia({
  src,
  alt = "",
  ratio = 16 / 9,
  imgProps,
  className,
  style,
  children,
  ...props
}: CardMediaProps) {
  return (
    <div
      {...props}
      className={["vx-card__media", className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio, ...style }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...imgProps}
          className={["vx-card__media-img", imgProps?.className]
            .filter(Boolean)
            .join(" ")}
          src={src}
          alt={alt}
        />
      ) : null}
      {children ? (
        <div className="vx-card__media-overlay">{children}</div>
      ) : null}
    </div>
  );
}
