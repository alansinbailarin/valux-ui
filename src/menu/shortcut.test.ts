import { describe, expect, it } from "vitest";

import { matchesShortcut, parseShortcut } from "./shortcut";

describe("parseShortcut", () => {
  it("parses mac-style modifier symbols and a key", () => {
    expect(parseShortcut("⌘D")).toEqual({
      meta: true,
      shift: false,
      alt: false,
      ctrl: false,
      key: "d",
    });
    expect(parseShortcut("⇧⌘S")).toMatchObject({ meta: true, shift: true, key: "s" });
    expect(parseShortcut("⌥⌃X")).toMatchObject({ alt: true, ctrl: true, key: "x" });
  });

  it("maps special key symbols", () => {
    expect(parseShortcut("⌫")).toMatchObject({ key: "backspace" });
    expect(parseShortcut("↵")).toMatchObject({ key: "enter" });
  });
});

describe("matchesShortcut", () => {
  it("matches a keyboard event against a shortcut string", () => {
    const event = {
      key: "d",
      metaKey: true,
      shiftKey: false,
      altKey: false,
      ctrlKey: false,
    };
    expect(matchesShortcut(event, "⌘D")).toBe(true);
    expect(matchesShortcut(event, "D")).toBe(false);
    expect(matchesShortcut({ ...event, metaKey: false }, "⌘D")).toBe(false);
  });

  it("matches bare special keys without modifiers", () => {
    const backspace = {
      key: "Backspace",
      metaKey: false,
      shiftKey: false,
      altKey: false,
      ctrlKey: false,
    };
    expect(matchesShortcut(backspace, "⌫")).toBe(true);
  });
});
