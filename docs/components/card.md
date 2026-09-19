# Card

A composable surface — a bordered container that groups Media, Header,
Title, Subtitle, Body, and Footer, all optional, all stacked in whatever
order you give them. Phase 1 is the static surface: no press, no link,
no expand — just a themed box you fill in, with a customizable
interior. Three looks: `outline` (default, a hairline border),
`elevated` (hairline + drop shadow in light, a raised surface + inset
highlight in dark — never shadow-dependent), and `soft` (a raised
surface with the same hairline in light).

```tsx
import { Card } from "@valux/ui";

<Card variant="elevated" style={{ maxWidth: 360 }}>
  <Card.Media src="/report-cover.jpg" ratio={16 / 9} />
  <Card.Header>
    <Card.Title>Quarterly report</Card.Title>
    <Card.Subtitle>Q2 2026</Card.Subtitle>
  </Card.Header>
  <Card.Body>Revenue grew 12% over the previous quarter.</Card.Body>
  <Card.Footer>
    <Button variant="ghost">Dismiss</Button>
    <Button color="primary">Open</Button>
  </Card.Footer>
</Card>
```

## Examples

Three variants, side by side:

```tsx
<Card variant="outline">
  <Card.Header>
    <Card.Title>Outline</Card.Title>
    <Card.Subtitle>The default variant</Card.Subtitle>
  </Card.Header>
  <Card.Body>Defined border, no shadow.</Card.Body>
</Card>
<Card variant="elevated">…</Card>
<Card variant="soft">…</Card>
```

Media with overlaid text (App Store "Today" style):

```tsx
<Card variant="elevated" style={{ maxWidth: 360 }}>
  <Card.Media ratio={4 / 3}>
    <span style={{ position: "absolute", inset: 0, background: "…" }} />
    <Card.Title as="h4" style={{ position: "relative", color: "#fff" }}>
      Featured
    </Card.Title>
  </Card.Media>
  <Card.Body>Support copy under the image.</Card.Body>
</Card>
```

## API

- **`Card`** — root: `<div>` accepting all native div props, plus
  `variant` (`"outline" | "elevated" | "soft"`, default `"outline"`).
  All anatomy is optional — a bare `<Card><Card.Body>…</Card.Body></Card>`
  is valid.
- **`Card.Media`** — cover area. `src` renders an `<img>` (`alt`
  defaults to `""` — set it for meaningful images); `ratio` reserves
  the aspect ratio to avoid layout shift (default `16/9`); `imgProps`
  passes native `<img>` attributes through to the shortcut image
  (everything except `src`/`alt`). `children` overlay the media
  (App Store text-over-cover) — pair with `Card.Title` styled for
  contrast against the image.
- **`Card.Header`** — groups `Card.Title` + `Card.Subtitle` above the
  body.
- **`Card.Title`** — semantic heading; `as` picks the level
  (`"h2" | "h3" | "h4" | "h5" | "h6"`, default `"h3"`) so a card's
  heading can match its place in the page outline.
- **`Card.Subtitle`** — secondary line under the title, muted color.
- **`Card.Body`** — free content region.
- **`Card.Footer`** — action row, right-aligned, kit control gap
  between buttons.
- **`Card.Separator`** — hairline divider between sections. `inset`
  (`"none" | "content"`, default `"none"`) picks whether it bleeds to the
  card edge or lines up with the padded content edge (the iOS
  grouped-list look). Renders an `<hr>`, so it is an exposed
  `separator` for assistive tech with no extra ARIA.

### Interior

`Card.Header`, `Card.Body`, and `Card.Footer` share two extra props:

- **`surface`** (`"none" | "subtle"`, default `"none"`) — puts that one
  section on a slightly different plane, for the grouped-settings look
  where a header or footer sits off the card's own surface. `"subtle"`
  is a translucent wash of the foreground color
  (`--vx-card-subtle-alpha`), not a fixed fill, so it reads correctly on
  all three variants and in both modes.
- **`padding`** (`"none"`) — drops that section's padding. Omit it to
  inherit the card's spacing.

`Card` itself takes **`padding`** (`"default" | "none"`), which applies
to the card and every part inside it. `Card.Media` always bleeds to the
card edges either way.

```tsx
<Card variant="soft">
  <Card.Header surface="subtle">
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Separator />
  <Card.Body>Wi-Fi</Card.Body>
  <Card.Separator inset="content" />
  <Card.Body>Bluetooth</Card.Body>
  <Card.Footer padding="none" surface="subtle">
    <Button variant="ghost" style={{ width: "100%" }}>See all</Button>
  </Card.Footer>
</Card>
```

## Behavior

- Every part is a plain, non-interactive div (or `<img>`/heading) —
  phase 1 ships no press, link, or expand behavior; those land in
  later phases.
- Parts stack in whatever order you render them; spacing between parts
  comes from the card padding/gap tokens, so density theming stays
  centralized.
- No variant ever relies on shadow alone to read as "above" the page,
  because a page is either white or near-black and each kills a
  different cue. In light, `elevated` and `soft` carry a hairline as
  well as their fill — a drop shadow does not register on white. In
  dark, `elevated` flips to the raised plane plus an inset top
  highlight and the hairline switches off, since shadows barely read on
  dark backgrounds.
- Every variant is checked against the page it sits on, in *both*
  modes: `src/card/card-contrast.styles.test.ts` requires each one to
  clear the page by at least 2.5 OKLCH lightness points or carry an
  edge of at least 15% alpha. Shadow deliberately counts for nothing.
- `outline`'s border and `elevated`'s shadow both derive from theme
  tokens, so they stay correct inside a nested opposite-mode island.

## Theming

Card sits on the kit's shared surface ladder — `--vx-surface-1` (the
page), `--vx-surface-2` (raised) — the same ladder Menu, Dialog,
Popover, and Select consume at `--vx-surface-3`. Retheme the ladder and
every component follows.

### Instance tokens

These are public API. Set them in `style` on a single `<Card>` and they
cascade into every part, because Card resolves all of them on the card
element itself rather than on `:root`:

| Token | What it does |
| --- | --- |
| `--vx-card-padding` | Padding of every part (Header/Body/Footer, Media overlay). |
| `--vx-card-gap` | Vertical spacing between parts. |
| `--vx-card-shadow` | `elevated`'s box-shadow list. Mode-flipped: dark swaps the drop shadow for an inset top highlight. |
| `--vx-card-border-alpha` | Alpha of `outline`'s border and of `Card.Separator`. |
| `--vx-card-raised-border-alpha` | Alpha of the hairline `elevated` and `soft` carry. `0%` in dark. |
| `--vx-card-elevated-bg` | Overrides `elevated`'s fill outright (unset by default; the fill is otherwise derived from the ladder). |
| `--vx-card-elevated-shadow` | Overrides `elevated`'s shadow outright, ignoring `--vx-card-shadow`. |
| `--vx-card-subtle-alpha` | Strength of a section's `surface="subtle"` wash. |
| `--vx-card-separator-inset` | Inset used by `Card.Separator inset="content"`. |

```tsx
<Card
  variant="elevated"
  style={{
    "--vx-card-padding": "1.5rem",
    "--vx-card-gap": "0.75rem",
    "--vx-card-shadow": "0 8px 30px rgb(79 70 229 / 0.28)",
  } as CSSProperties}
>
  …
</Card>
```

Set the same tokens on `:root` (or a mode island) to retheme every card
at once. The mode blocks only flip inherited scalars, never the derived
values, so a nested opposite-mode island — and a portaled panel themed
by `usePortalTheme` — resolves them from the mode it actually inherits.
