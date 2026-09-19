export interface ParsedShortcut {
  meta: boolean;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  key: string;
}

const MODIFIERS: Record<string, keyof Omit<ParsedShortcut, "key">> = {
  "⌘": "meta",
  "⇧": "shift",
  "⌥": "alt",
  "⌃": "ctrl",
};

const SPECIAL_KEYS: Record<string, string> = {
  "⌫": "backspace",
  "⌦": "delete",
  "↵": "enter",
  "⏎": "enter",
  "⎋": "escape",
  "␣": " ",
};

/** Parses a display shortcut like "⇧⌘D" into modifiers + a lowercase key. */
export function parseShortcut(shortcut: string): ParsedShortcut {
  const parsed: ParsedShortcut = {
    meta: false,
    shift: false,
    alt: false,
    ctrl: false,
    key: "",
  };

  for (const char of shortcut.trim()) {
    const modifier = MODIFIERS[char];
    if (modifier) parsed[modifier] = true;
    else parsed.key = SPECIAL_KEYS[char] ?? char.toLowerCase();
  }

  return parsed;
}

interface KeyEventLike {
  key: string;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
}

export function matchesShortcut(
  event: KeyEventLike,
  shortcut: string,
): boolean {
  const parsed = parseShortcut(shortcut);

  return (
    parsed.key === event.key.toLowerCase() &&
    parsed.meta === event.metaKey &&
    parsed.shift === event.shiftKey &&
    parsed.alt === event.altKey &&
    parsed.ctrl === event.ctrlKey
  );
}
