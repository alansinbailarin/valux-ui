import type { InputHTMLAttributes } from "react";

import type { InputType } from "./Input.types";

/** Per-type defaults: the RIGHT mobile keyboard and text behavior out of
 * the box. Anything here is overridable by explicit props. */
export const TYPE_PRESETS: Record<InputType, InputHTMLAttributes<HTMLInputElement>> = {
  text: {},
  email: {
    inputMode: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
  password: {
    autoCapitalize: "none",
    spellCheck: false,
  },
  search: {
    inputMode: "search",
    enterKeyHint: "search",
    spellCheck: false,
  },
  number: {
    // Native number keeps form semantics; CSS hides the spinners and
    // inputMode brings up the decimal pad on phones.
    inputMode: "decimal",
  },
  tel: {
    inputMode: "tel",
    autoComplete: "tel",
  },
  url: {
    inputMode: "url",
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
  },
};
