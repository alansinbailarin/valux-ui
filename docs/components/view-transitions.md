# View transitions (Hero)

SwiftUI-style transitions for the web: elements marked as SHARED fly
between pages when you navigate, and same-page state changes can morph
instead of snapping. Built on the browser's View Transitions API with
the kit's choreography. Firefox (no API yet) degrades to a plain
navigation; reduced motion skips transitions entirely.

Lives in its own entry — `@valux/ui/transitions` — because it
requires the Next.js App Router (`next` is an OPTIONAL peer dependency;
the main entry stays Next-free).

```tsx
import {
  Hero,
  TransitionLink,
  ViewTransitions,
  useViewTransition,
} from "@valux/ui/transitions";
```

## Setup (once)

Mount the watcher inside the layout whose routes will transition:

```tsx
// app/layout.tsx (or a section layout)
<ViewTransitions />
```

## API

- **`<ViewTransitions />`** — resolves the in-flight transition when the
  new route commits. Mount once, like the Toaster.
- **`<TransitionLink href transition? replace?>`** — an anchor that runs
  the navigation inside a view transition. `transition` picks the page
  preset (below). Meta/Ctrl-clicks open normally; `replace` uses
  router.replace.
- **`<Hero name>`** — marks a shared element (matched geometry): the
  element with the same `name` on the other page is where it flies.
  Names must be unique per page; use as many heroes as you want.
- **`useViewTransition()`** — same-page state morphs:
  `transition(() => setState(...))`.
- **`runViewTransition(update, preset?)`** — the low-level engine both
  build on, exported for advanced cases.

## Presets

| `transition=` | Choreography |
| --- | --- |
| *(default)* | Shared elements travel over a quiet root crossfade. |
| `"expand"` | The App Store card-to-page recipe (Example 2). |
| `"slide"` | Old page slides out left, new slides in from the right. |
| `"fade"` | Plain crossfade, both directions. |
| any custom name | Lands on `<html data-vx-transition="...">` — write your own CSS (Example 4). |

---

## Example 1 — list → detail (hero basics)

The card, its icon, and its title fly into the detail header.

```tsx
// app/notes/page.tsx
{notes.map((note) => (
  <TransitionLink key={note.id} href={`/notes/${note.id}`}>
    <Hero name={`card-${note.id}`} className="card">
      <Hero name={`icon-${note.id}`} className="icon">{note.emoji}</Hero>
      <Hero name={`title-${note.id}`}><h3>{note.title}</h3></Hero>
    </Hero>
  </TransitionLink>
))}

// app/notes/[id]/page.tsx — the SAME names mark the landing spots
<Hero name={`card-${note.id}`} className="detail">
  <Hero name={`icon-${note.id}`} className="icon-lg">{note.emoji}</Hero>
  <Hero name={`title-${note.id}`}><h1>{note.title}</h1></Hero>
</Hero>
```

Rule of thumb: hero the pieces whose GEOMETRY should morph
independently (an icon growing, a title re-sizing). If a whole block
should travel as one unit, use ONE hero around it — see Example 2.

## Example 2 — the App Store expansion (`transition="expand"`)

A photo card that becomes the page: the image stays continuous the
whole flight, the outgoing feed sinks behind, and the description rises
after the card lands.

```tsx
// Feed: ONE hero per card — art and overlay travel as a single piece.
<TransitionLink href={`/apps/${app.id}`} transition="expand">
  <Hero name={`app-${app.id}`} className="card">
    <img src={app.image} alt="" />
    <div className="overlay">
      <p>{app.category}</p>
      <h3>{app.title}</h3>
    </div>
  </Hero>
</TransitionLink>

// Detail: the same hero name on the header block…
<Hero name={`app-${app.id}`} className="detail-hero">
  <img src={app.image} alt="" />
  <div className="overlay">
    <p>{app.category}</p>
    <h1>{app.title}</h1>
  </div>
</Hero>

// …and the below-the-fold content named "vx-body" (the preset's
// convention): it RISES once the card lands, drops fast on the way back.
<Hero name="vx-body">
  <article>{app.description}</article>
</Hero>
```

Match the flying corner radius to your card:

```css
:root { --vx-vt-radius: 1.75rem; } /* default: the kit's panel radius */
```

A close button is just `<TransitionLink href="/apps"
transition="expand">✕</TransitionLink>` — the whole thing plays in
reverse.

## Example 3 — same-page morphs

```tsx
const transition = useViewTransition();

<button onClick={() => transition(() => setOrder(shuffled))}>
  Shuffle
</button>
```

Heroes glide to their new slots; anything unnamed crossfades. Works for
tab switches, layout toggles, filters — any state change.

## Example 4 — a custom preset

```tsx
<TransitionLink href="/gallery" transition="zoom">Gallery</TransitionLink>
```

```css
html[data-vx-transition="zoom"]::view-transition-old(root) {
  animation: my-zoom-out 0.3s ease both;
}
html[data-vx-transition="zoom"]::view-transition-new(root) {
  animation: my-zoom-in 0.35s ease both;
}
```

The attribute exists only for the transition's lifetime.

---

## Lessons the `expand` preset encodes (so you never relearn them)

These came from frame-by-frame review; they apply to ANY custom preset:

1. **Never crossfade two differently-scaled snapshots.** The default
   old/new crossfade double-exposes ("ghosting") when the sides differ
   in size. `expand` shows only the NEW snapshot while the box morphs.
2. **Cover, don't stretch.** With different aspect ratios, the default
   stretch reads as "a different card appeared". `object-fit: cover` on
   the snapshots makes aspect changes CROP — more content is revealed,
   nothing deforms.
3. **Round the flying box, not the snapshot.** Radius baked into a
   snapshot scales with it (corner artifacts mid-flight). Put it on
   `::view-transition-image-pair(...)` so it stays constant.
4. **Late, transparent below-the-fold content.** A rising block with
   its own background reads as a floating slab; keep it transparent and
   delay it until the main element has landed.
5. **Give the outgoing page depth.** Dim + scale it slightly (sink)
   instead of leaving it frozen behind the flight.

## Notes & limits

- Old views are snapshots: text doesn't reflow mid-flight, videos/GIFs
  freeze, and the page is briefly non-interactive (~400ms). One
  transition runs at a time.
- `Hero` names must be unique per page — duplicates make the browser
  skip those groups.
- Roadmap: direction-aware back gestures, per-hero spring configs, and
  a live-content FLIP engine for cases snapshots can't cover.
