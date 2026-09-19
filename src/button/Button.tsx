"use client";

import { forwardRef } from "react";
import type { MouseEventHandler, Ref } from "react";

import type {
  ButtonAsAnchorProps,
  ButtonAsButtonProps,
  ButtonComponent,
  ButtonProps,
} from "./Button.types";
import { ButtonContent } from "./ButtonContent";
import { useButtonInteraction } from "./useButtonInteraction";

const ButtonImplementation = forwardRef<HTMLElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      disabled,
      onLostPointerCapture,
      onPointerCancel,
      onPointerDown,
      onPointerUp,
      style,
      cursor,
      variant = "solid",
      color = "neutral",
      size,
      loading = false,
      loadingText,
      startIcon,
      endIcon,
      iconOnly = false,
      fullWidth = false,
      as = "button",
      ...props
    },
    ref,
  ) {
    const buttonClassName = ["vx-button", className].filter(Boolean).join(" ");
    const isDisabled = Boolean(disabled || loading);
    const interaction = useButtonInteraction<HTMLElement>({
      disabled: isDisabled,
      onLostPointerCapture,
      onPointerCancel,
      onPointerDown,
      onPointerUp,
    });
    const buttonStyle = isDisabled
      ? { ...style, cursor: "not-allowed" }
      : cursor
        ? { ...style, cursor }
        : style;
    const presentation = {
      className: buttonClassName,
      style: buttonStyle,
      "aria-busy": loading || undefined,
      "data-vx-variant": variant,
      "data-vx-color": color,
      "data-vx-size": size,
      "data-vx-loading": loading ? "" : undefined,
      "data-vx-icon-only": iconOnly ? "" : undefined,
      "data-vx-full-width": fullWidth ? "" : undefined,
    };
    const content = (
      <ButtonContent
        endIcon={endIcon}
        iconOnly={iconOnly}
        loading={loading}
        loadingText={loadingText}
        startIcon={startIcon}
      >
        {children}
      </ButtonContent>
    );

    if (as === "a") {
      const { href, onClick, tabIndex, ...anchorProps } =
        props as ButtonAsAnchorProps;
      const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        if (isDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      };

      return (
        <a
          {...anchorProps}
          {...interaction}
          {...presentation}
          ref={ref as Ref<HTMLAnchorElement>}
          role="link"
          href={isDisabled ? undefined : href}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : tabIndex}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    const { type = "button", ...buttonProps } = props as ButtonAsButtonProps;

    return (
      <button
        {...buttonProps}
        {...interaction}
        {...presentation}
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
      >
        {content}
      </button>
    );
  },
);

export const Button = ButtonImplementation as ButtonComponent;
