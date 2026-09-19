import type { ReactNode } from "react";

import type { ButtonContentProps } from "./ButtonContent.types";

function IconSlot({
  children,
  position,
}: {
  children: ReactNode;
  position: "start" | "end";
}) {
  return (
    <span
      aria-hidden="true"
      className={`vx-button__icon vx-button__icon--${position}`}
    >
      {children}
    </span>
  );
}

export function ButtonContent({
  children,
  endIcon,
  iconOnly,
  loading,
  loadingText,
  startIcon,
}: ButtonContentProps) {
  const hasLoadingText = Boolean(
    !iconOnly &&
      loadingText !== undefined &&
      loadingText !== null &&
      loadingText !== "",
  );

  return (
    <span className="vx-button__body">
      <span
        aria-hidden={loading && hasLoadingText ? true : undefined}
        className="vx-button__content"
      >
        {!iconOnly && startIcon ? (
          <IconSlot position="start">{startIcon}</IconSlot>
        ) : null}
        {children}
        {!iconOnly && endIcon ? (
          <IconSlot position="end">{endIcon}</IconSlot>
        ) : null}
      </span>
      {loading ? (
        <span
          aria-hidden={hasLoadingText ? undefined : true}
          className="vx-button__loading"
        >
          <span aria-hidden="true" className="vx-button__spinner" />
          {hasLoadingText ? (
            <span className="vx-button__loading-text">{loadingText}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
