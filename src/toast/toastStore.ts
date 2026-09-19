export type { ToastAction, ToastItem, ToastOptions, ToastTone } from "./toastTypes";

import type { ToastItem, ToastOptions } from "./toastTypes";

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): ToastItem[] {
  return items;
}

/** Show a toast: `toast("Saved")` or `toast({ title, description, tone })`. */
export function toast(options: ToastOptions | string): number {
  const normalized = typeof options === "string" ? { title: options } : options;
  // Coalesce: re-firing an identical pending toast refreshes it instead of
  // queueing a duplicate.
  const twin = items.find(
    (item) =>
      !item.leaving &&
      item.tone === (normalized.tone ?? "neutral") &&
      typeof item.title === "string" &&
      item.title === normalized.title &&
      item.description === normalized.description,
  );
  if (twin) {
    items = items.map((item) =>
      item === twin ? { ...item, revision: item.revision + 1 } : item,
    );
    emit();
    return twin.id;
  }
  const id = nextId++;
  items = [
    ...items,
    {
      id,
      title: normalized.title,
      description: normalized.description,
      tone: normalized.tone ?? "neutral",
      duration: normalized.duration ?? 4000,
      leaving: false,
      revision: 0,
      action: normalized.action,
      loading: normalized.loading ?? false,
    },
  ];
  emit();
  return id;
}

/** Update a live toast in place (restarts its timer). */
export function updateToast(id: number, patch: ToastOptions): void {
  items = items.map((item) =>
    item.id === id
      ? {
          ...item,
          ...patch,
          tone: patch.tone ?? item.tone,
          duration: patch.duration ?? item.duration,
          loading: patch.loading ?? false,
          leaving: false,
          revision: item.revision + 1,
        }
      : item,
  );
  emit();
}

type PromiseMessage<T> = ToastOptions | string | ((value: T) => ToastOptions | string);

function resolveMessage<T>(message: PromiseMessage<T>, value: T): ToastOptions {
  const resolved = typeof message === "function" ? message(value) : message;
  return typeof resolved === "string" ? { title: resolved } : resolved;
}

/** Loading pill that morphs into success/error when the promise settles.
 * Returns the original promise untouched. */
toast.promise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: ToastOptions | string;
    success: PromiseMessage<T>;
    error: PromiseMessage<unknown>;
  },
): Promise<T> => {
  const base = typeof messages.loading === "string" ? { title: messages.loading } : messages.loading;
  const id = toast({ ...base, loading: true, duration: 0 });
  promise.then(
    (value) => {
      const next = resolveMessage(messages.success, value);
      updateToast(id, { tone: "success", duration: 4000, ...next });
    },
    (reason) => {
      const next = resolveMessage(messages.error, reason);
      updateToast(id, { tone: "danger", duration: 5000, ...next });
    },
  );
  return promise;
};

/** Begin a toast's exit; with no id, dismisses ALL pending toasts. */
toast.dismiss = (id?: number): void => {
  if (id !== undefined) return markToastLeaving(id);
  for (const item of items) markToastLeaving(item.id);
};

export function markToastLeaving(id: number): void {
  let changed = false;
  items = items.map((item) => {
    if (item.id !== id || item.leaving) return item;
    changed = true;
    return { ...item, leaving: true };
  });
  if (changed) emit();
}

export function removeToast(id: number): void {
  const before = items.length;
  items = items.filter((item) => item.id !== id);
  if (items.length !== before) emit();
}
