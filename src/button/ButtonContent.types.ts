import type { ReactNode } from "react";

export interface ButtonContentProps {
  children?: ReactNode;
  endIcon?: ReactNode;
  iconOnly: boolean;
  loading: boolean;
  loadingText?: ReactNode;
  startIcon?: ReactNode;
}
