# Checkbox & Radio

Native inputs styled to the kit — forms, keyboard, and screen readers
work for free. The checkbox's checkmark DRAWS itself in; the radio's dot
POPS with the house overshoot. Pressing either dips it like a key.

```tsx
import { Checkbox, Radio, RadioGroup } from "@valux/ui";

<Checkbox label="Accept the terms" description="You can leave anytime." />
<Checkbox label="Select all" indeterminate />

<RadioGroup label="Plan" defaultValue="pro" onValueChange={setPlan}>
  <Radio value="free" label="Free" description="To try things out." />
  <Radio value="pro" label="Pro" />
  <Radio value="team" label="Team" />
</RadioGroup>
```

## Checkbox

- `label` / `description` — clicking the label toggles; the description
  wires via `aria-describedby`.
- `indeterminate` — the mixed "select all over a partial selection"
  state: shows a bar instead of the mark and reports mixed to assistive
  tech. Clicking resolves it to checked.
- Everything else passes through: `checked`/`defaultChecked`, `onChange`,
  `name` (submits `"on"`), `disabled`, `required`, …
- `size` — `"sm" | "md" | "lg"` (1 / 1.25 / 1.5rem boxes) on both
  Checkbox and Radio.
- The box is a soft-cornered square (radius ~35% — family geometry, like
  the Switch chip), filled with the theme primary when on; the MARK uses
  the surface color (white on light, dark on dark — Switch-chip
  philosophy).

## RadioGroup + Radio

- `RadioGroup` — `label` (wired via `aria-labelledby`), `value` /
  `defaultValue` / `onValueChange`, `name` (auto-generated when omitted),
  `disabled` for the whole group.
- `Radio` — `value` (required), `label`, `description`, per-item
  `disabled`.
- Arrow keys move the selection natively inside the group; the ring is a
  true circle (radios ARE circles). Checked fills the OUTER circle with
  the primary while the popping dot is the surface color — the inverted
  look shared with the Switch chip and the Checkbox mark.

## Behavior

- Focus shows the kit ring on the box/ring; reduced motion disables the
  draw/pop transitions.
- Colors derive from tokens: dark mode and tinted surfaces need no extra
  props.
