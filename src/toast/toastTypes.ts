import type { ReactNode } from "react";

export type ToastTone = "neutral" | "success" | "danger" | "warning" | "info";

export interface ToastAction {
  label: ReactNode;
  onClick: () => void;
}

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss after this many ms (default 4000). 0 keeps it sticky. */
  duration?: number;
  /** Tabbable action button (e.g. "Undo"); clicking it also dismisses. */
  action?: ToastAction;
  /** Spinner state (used by toast.promise; settable directly too). */
  loading?: boolean;
}

export interface ToastItem {
  id: number;
  title: ReactNode;
  description?: ReactNode;
  tone: ToastTone;
  duration: number;
  /** Playing its exit animation (removed when it finishes). */
  leaving: boolean;
  /** Bumped when an identical toast re-fires — restarts the timer. */
  revision: number;
  action?: ToastAction;
  loading: boolean;
}
