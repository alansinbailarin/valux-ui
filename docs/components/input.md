# Input & TextArea

Text fields with a fixed label above, two fill variants, and CURATED
types: each `type` wires the right mobile keyboard and behavior out of
the box. Validation never tints the border — the tone lives in the
status line's dot and text (and the caret).

```tsx
import { Input, TextArea } from "@valux/ui";

<Input label="Email" type="email" hint="Work or personal." />
<Input label="Password" type="password" />         {/* built-in eye toggle */}
<Input label="Username" tone="danger" message="Already taken." />
<TextArea label="Notes" maxLength={280} showCount />
```

## Types (`type` prop — same name as HTML, curated values)

`"text" | "email" | "password" | "search" | "number" | "tel" | "url"`

Each preset configures `inputMode`, `enterKeyHint`, `autoComplete`,
capitalization/spellcheck, and quirks — all overridable by explicit props:

- **email** — email keyboard, `autocomplete="email"`, no autocorrect.
- **password** — built-in reveal (eye) toggle with `aria-pressed`; pass
  your own `suffix` to replace it; `revealLabel` localizes it.
- **search** — search keyboard with a Search enter key.
- **number** — decimal pad on phones; native spinners replaced by styled
  chevron steppers that honor `step`/`min`/`max` (localize with
  `stepLabels`); ArrowUp/ArrowDown still work on the field.
- **tel** — phone pad, `autocomplete="tel"`.
- **url** — URL keyboard, no autocapitalize/autocorrect.

Dates, files, and colors are future dedicated components, not types.

## API

- `label` — visible label above the field (always label your inputs; use
  `aria-label` only when the design truly has no visible label).
- `variant` — `"outline"` (default: subtle border, no fill) ·
  `"soft"` (whisper of washed fill).
- `size` — `"sm" | "md" | "lg"`; heights match the Button scale
  (2 / 2.5 / 3rem) so forms align.
- `hint` — help text under the field; `message` + `tone`
  (`"danger" | "success" | "warning"`) replace it with a status line
  carrying the toast-family dot. `tone="danger"` also sets
  `aria-invalid`.
- `prefix` / `suffix` — icons, static text, or buttons inside the field;
  they are in-flow, so wide text prefixes (`https://`, `$`) never overlap
  the value.
- `maxLength` + `showCount` — live character counter.
- Everything else passes through (`name`, `value`/`defaultValue`,
  `required`, `readOnly`, `disabled`, `onChange`, …) — controlled and
  uncontrolled both work, plain `<form>` included.
- **`TextArea`** — same chrome; `autoGrow` (default) up to `maxRows`.

## Behavior

- Focus is ALWAYS the theme-primary halo (even on invalid fields) — never
  the browser ring, never a tone-tinted border.
- Label, hint, and message are wired via generated ids
  (`aria-describedby`); status messages announce via `role="status"`.
- Browser autofill is repainted to the theme (no WebKit yellow).
- On touch devices the font floors at 16px so iOS never zooms the field.
- Everything derives from provider tokens: dark mode and tinted surfaces
  keep contrast with no extra props.
- Validation: the curated types keep NATIVE constraint validation (a
  `type="url"`/`"email"` field with `required` blocks form submit with
  the browser's own check). For inline feedback, pair your validation
  with `tone` + `message` — the kit never auto-judges while typing.
