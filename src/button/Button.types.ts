import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

interface ButtonSharedProps {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  cursor?: CSSProperties["cursor"];
  disabled?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

type ButtonContentMode =
  | { iconOnly?: false }
  | { iconOnly: true; "aria-label": string; children: ReactNode };

export type ButtonVariant = "solid" | "outline" | "soft" | "ghost";
export type ButtonColor =
  | "neutral"
  | "primary"
  | "danger"
  | "success"
  | "warning"
  | "info";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export type ButtonAsButtonProps = ButtonSharedProps &
  ButtonContentMode &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "disabled"> & {
    as?: "button";
  };

export type ButtonAsAnchorProps = ButtonSharedProps &
  ButtonContentMode &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "disabled"> & {
    as: "a";
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

export interface ButtonComponent {
  (
    props: ButtonAsAnchorProps & RefAttributes<HTMLAnchorElement>,
  ): ReactElement | null;
  (
    props: ButtonAsButtonProps & RefAttributes<HTMLButtonElement>,
  ): ReactElement | null;
}
