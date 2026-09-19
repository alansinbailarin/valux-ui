# Select

A single-value picker whose trigger looks like an Input field and whose
panel MORPHS out of that field with the Menu choreography. Options are
DATA (not free composition), so the trigger resolves the selected label
while closed and the combobox filter is built in.

```tsx
import { Select } from "@valux/ui";

<Select
  options={[
    { value: "mx", label: "México" },
    { value: "us", label: "United States", description: "USD" },
    { value: "br", label: "Brasil", disabled: true },
  ]}
  defaultValue="mx"
  onValueChange={setCountry}
  name="country"
>
  <Select.Trigger label="Country" placeholder="Pick one…" />
  <Select.Content searchable />
</Select>
```

## API

- **`Select`** (root) — `options` (`{ value, label, description?,
  disabled?, textValue? }[]`), `value` / `defaultValue` /
  `onValueChange`, `name` (submits via hidden input), `disabled`.
- **`Select.Trigger`** — the field: `label`, `placeholder`, `hint` /
  `message` / `tone` (same status-line contract as Input), `variant`
  (`outline`/`soft`) and `size` (`sm`/`md`/`lg`) on the Input scale. The
  chevron rotates while open.
- **`Select.Content`** — the panel: `side`/`align` (collision-aware,
  same as Menu), `searchable` + `searchPlaceholder` + `emptyMessage`
  for combobox mode (a filter field at the top of the panel).

## Behavior

- The WHOLE bordered field is the morph origin: the panel visibly grows
  out of it and returns into it; the pull-to-close gesture scrubs the
  return morph like every other kit surface.
- Keyboard: ArrowDown/ArrowUp open from the trigger; inside, arrows +
  Home/End move, printable characters type-ahead, Enter/Space select,
  Esc/Tab/outside click close; focus returns to the trigger. Focus lands
  on the selected option (or the filter when `searchable`).
- The selected option shows the family checkmark and the primary color;
  `aria-selected`, `role="listbox"`/`"option"`, and the combobox pattern
  on the trigger are wired for assistive tech.
- Reduced motion swaps the morph for an instant crossfade.
- `textValue` covers filtering/type-ahead when `label` is rich JSX.
