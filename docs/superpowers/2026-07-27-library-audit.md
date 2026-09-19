# Valux UI — Full Library Audit (2026-07-27)

Four parallel deep audits: mobile/touch, desktop/a11y, architecture/packaging, motion/performance. Findings verified against source with file:line references. This document is the consolidated, prioritized result; fix phases at the end.

**Overall verdict:** unusually disciplined engineering in the details (native inputs, phase-scoped `will-change`, portal theming, self-healing state machines, real iOS lessons encoded in comments) sitting on a handful of systemic gaps: the published artifact breaks RSC, the flagship gestures die on real iPhones, keyboard/AT coverage has release-blocker holes, and the motion choreography is 40–200% outside platform norms with no API to calm it.

---

## P0 — Breaks consumers or core promise (fix before any publish)

### Packaging
1. **Build strips `"use client"` — RSC crash.** Rolldown merges modules and drops directives; `dist/index.js` has zero. `createContext` runs at module scope → any `import { X } from "@valux/ui"` in a Server Component crashes under `react-server`. Demo never caught it (imports `@/src`). Fix: `unbundle: true` in `tsdown.config.ts` + react-server smoke test in `verify-package.mjs` (`node --conditions react-server`). README:40's claim is currently false.
2. **Six compound barrels lack `"use client"`** (`menu/dialog/sheet/popover/tooltip/drawer index.ts`) — after fix 1 they'd mutate client-reference proxies; `Menu.Trigger` arrives `undefined`. contextmenu/select already correct; card correctly server-safe.
3. **`mode:"system"` + dark OS loses 12 tokens** — success/warning/info (+solid/foreground/on-*) missing from the system-dark block in `modes.css:70-95` vs explicit dark `:33-68`. Default mode ships light greens/ambers/blues on dark surfaces. Root cause: duplicated token lists drifted. Fix: shared selector list.

### Mobile (the "native feel" promise)
4. **No `touch-action` on vertically-dragged surfaces** (sheet.css, dialog-content.css, menu-content.css, popover.css, select.css) → iOS fires `pointercancel`, pull-to-dismiss and close-scrub rubber-band and die. Kit already does this right on switch/drawer/toast. Fix: `pan-x` on drag-owning panel, scroller split where panel==scroller.
5. **`usePullDismiss.ts:74` guards `panel.scrollTop`** but with a `Body` the real scroller is the body (`panel` stays 0) → dragging a scrolled Sheet dismisses instead of scrolling. Fix: `canScrollUp(event.target, panel)` (already imported; wheel path uses it).
6. **Zero `visualViewport` handling** — keyboard covers Sheet inputs; `useScrollLock`'s `position:fixed` body defeats Safari's auto-scroll-into-view; positioned surfaces never reposition on resize/rotate/keyboard (`useMenuPosition`, `useDialogPosition` run once).
7. **Stated iOS 13 floor is fiction** — 105 `color-mix()` (Safari 16.2), `:has()` (15.4), `inert` (15.5), `dvh` (15.4), zero `@supports`. On iOS 13–16.1 panels render unstyled/invisible. Fix: document floor as iOS 16.4+ (recommended) or add fallbacks for root tokens.

### A11y (WCAG release blockers)
8. **ContextMenu keyboard-unreachable** — bare div, no tabIndex, no Shift+F10 (`ContextMenuTrigger.tsx:57-70`).
9. **Toasts keyboard-undismissable** — dismissal on click of non-focusable div; no close button, no Esc, no F6 region hotkey; `duration: 0` toast is permanent (WCAG 2.1.1).
10. **Any open modal makes toasts invisible to AT** — `useInertBackground` inerts the Toaster portal (body sibling). Toast fired from inside a dialog = silently dropped. Fix: exempt `[data-vx-toaster]`.
11. **Focus trap defeated by hidden input** — `useFocusTrap.ts:5` matches `input[type="hidden"]` (Select renders one with `name`); Shift+Tab escapes the dialog. No visibility filtering.
12. **Focus ring invisible on solid buttons** — inset ring of fixed `#2563eb` on same-color fills = 1.00:1 (info), 1.01 (danger); WCAG 2.4.11 needs 3:1. Fix: `outline` + `outline-offset` (draws outside).
13. **Select options: no focus indicator** (`outline:none`, hover==focus at 1.10:1) — real DOM focus moves there, so listbox navigation is invisible.
14. **Forced-colors (Windows High Contrast): all 15 focus rules are box-shadow (stripped) + 11 `outline:none`** → zero focus indication kit-wide. No `forced-colors` queries anywhere.
15. **Focus stolen ~300ms after outside click** — every surface restores trigger focus unconditionally on unmount cleanup; user clicks an input, starts typing, focus yanks back to trigger. Fix: restore only if dismissal was keyboard or focus still inside panel.
16. **Muted text below 4.5:1 across the form layer** — placeholders 2.69:1, helpers/validation and check/radio/switch descriptions 4.24:1, menu shortcuts 2.93:1, etc. (SC 1.4.3).
17. **`parseColor` throws during render on most CSS colors** — only `#rgb/#rrggbb/rgb(,)` accepted; `hsl()`, `oklch()`, `rgba()`, named colors → `null` → `primaryContrast.ts:81` throws, crashing provider incl. SSR. Also: 4.5:1 only guaranteed for `-solid`, never for `--vx-color-primary` used by check/radio fills.

### Motion (correctness, not taste)
18. **Menu-item stagger is dead code** — `menu-item.css:32-34` redeclares `transition` shorthand later at equal specificity → items snap; the 0.2–0.4s delay ladder now delays hover-background instead.
19. **View transitions can hang the page forever** — `transitionEngine.ts:32` awaits a promise only resolved by pathname change; same-path link or blocked nav = document render-blocked permanently. No timeout. Fix: race an 800ms timeout + resolve orphaned pendings.
20. **`useSwitchDrag` leaks document listeners on unmount mid-drag** and never resets `body.userSelect` → page permanently unselectable. Cleanup only removes `pointerdown`.

---

## P1 — Important (fix soon; some overlap the calm-motion work)

**Motion tuning (root cause of Reddit "too much/bouncy/slow"):** ANTICIPATION 0.2 (60ms backwards = reads as lag), OVERSHOOT 0.16 (16% vs native 2-5%), menu 500ms / dialog 540 / toast entrance 900 / tooltip 300 (vs iOS ~350 / Material ~300 norms), 8 easings with y>1. **Calm preset proposal (full detail in motion audit):** ANTICIPATION 0, OVERSHOOT 0.02, ease `cubic-bezier(0.32,0.72,0,1)`, menu 280/200, dialog 320/220, context 240/180, toast 380, tooltip 140/100 2-keyframe fade+scale, keyframes 6→3/4. Keep today's values as `expressive` preset.

**Motion API gap:** `--vx-motion-*` tokens are decorative — consumed by button.css only; morph durations are hardcoded TS. Plan: real tokens (`--vx-motion-scale`, duration fast/base/slow, eases, `--vx-motion-blur`, `--vx-glass-blur/saturate`), engine reads them via the `getComputedStyle` it already does (`morphPlan.ts:31`), provider API `theme={{ motion: "calm" | "standard" | "expressive" | {scale, blur, glass} }}`, export `MorphPresets`. Portals inherit free via `usePortalTheme` cssText copy. **Default: calm.**

**Perf:** scrub/drag (the signature gesture) runs unpromoted — `will-change` only on opening/closing phases, scrub gated on `open`; and drags translate a live 24px backdrop-blur. Force `backdrop-filter: none` + promote while dragging. Forced reflow per pointermove in both pull hooks (`getBoundingClientRect` after style write — hoist to pointerdown like `useSwitchDrag:47`). Non-passive document wheel listeners while merely open; `swallowInertia` locks page scroll up to 1500ms. Blur stack: up to 4 concurrent blurs per dialog open; coarse-pointer only drops the scrim's. Sheet detents animate `height` (layout) — use transform/max-height. Interrupted morphs snap to full size before closing (seed close keyframes from computed transform). Unmemoized `onDismiss` in Sheet/Drawer surfaces resets live gesture state on parent re-render.

**Reduced motion loses on specificity in ~12 places** (both audits found independently) — reduce blocks at (0,1,0) vs animating rules at (0,3,0)+; tooltip fully unguarded, no JS check in tooltip at all. Fix pattern: `!important` like toast/sheet/drawer/transitions already do. Conversely toast/button reduce blocks freeze loading **spinners** — over-broad.

**A11y:** Popover leaks Tab focus to browser chrome (mirror Menu's Tab-closes); Select `aria-controls` points at panel not listbox + dangling `aria-labelledby` without label + searchable mode isn't a combobox pattern; ContextMenu menu has dangling `aria-labelledby` (and props can't override — spread order); Tooltip not hoverable (1.4.13) — pointer onto tooltip dismisses it; sticky `:hover` on touch (no `hover:hover` guards, 9 rules) + destructive item red tint has no `:focus-visible` counterpart; trigger click likely reopens surface (pointerdown-dismiss then click-toggle — untested because `fireEvent.click` skips pointerdown; exempt trigger in `useDismiss`); target sizes (steppers ~14×24 worst, checkbox sm 16×16, switch sm 44×22 — pseudo-element hit expansion + `pointer:coarse` min-heights); control borders 1.23–2.55:1 (SC 1.4.11); disabled opacity multiplies to 0.34; Select hidden input: no validation, still submits when disabled.

**Architecture:** only Select+ContextMenu are tree-shake-hostile (`Object.assign` without `@__PURE__`) — standardize; controlled/uncontrolled missing on Select (can't open programmatically) and ContextMenu; `className` stripped with no escape hatch on 5 form controls while `style` lands on the 1px hidden input — add `rootClassName`/`rootStyle`; consolidate byte-identical `useMenuState`/`useDialogState`, 4× `*Close.tsx`, 7× phase-reconciliation effect (~400 lines) into `src/overlay/`; **no `@layer`** — kit CSS beats Tailwind utilities of consumers (unlayered > layered): wrap in `@layer Valux UI`; verify-package covers 3 of 15 primitives and never imports `dist/transitions.js` nor runs react-server condition; no release automation (changesets + CI); npm tarball ships 30 internal planning docs (`docs/superpowers/`) — narrow `files`.

---

## P2 — Minor (batch opportunistically)

Mobile: inconsistent tap-highlight suppression; toast goo SVG filter on mobile GPU (degrade under `pointer:coarse`); sheet footer stacked-layout selector typo (`dialog-layout.css:44-48` missing `> *`); toast corners ignore horizontal safe-area; dialog uses `vh` where sheet uses `dvh`; switch drag divide-by-zero; menu items hover-only affordance (add `:active`, scope `:hover`); icon-only button + tooltip = unlabeled for sighted touch users (document).

Motion: morphPlan double chain-walk + triple `getComputedStyle` (3-4 forced layouts per open); `getImageData` sync readback for oklab colors; matchMedia per open; `data-vx-dragging` re-set per move; switch `:active` width transition during drag; scrub `querySelector`/`getTiming` per frame; `SCRUB_WINDOW=0.5` lands mid-streak (smeary); VT finished rejection unhandled + no morph↔VT coordination; `Hero` name validity/duplicates silent.

A11y: menu trigger no ArrowDown/Up-to-open; no roving tabindex (N tab stops exposed); type-ahead swallows Space + single-char shortcuts hijack it; scroll containers not keyboard-scrollable (no tabindex); `.vx-context-trigger` and form descriptions block text selection; toast double-announced + promise-settle sometimes never announced + danger uses polite; `--vx-color-border` dead token; `Button as="a"` disabled keeps `role="link"`; validation messages `role="status"` not `alert`; fog strips can obscure focused controls; `useDialogAria` mutates attrs post-mount (SSR snapshot unnamed).

Architecture: Select redeclares `MorphPhase`; `a11y ↔ morph` directory cycle; `docs:llms` not in verify + Radio undocumented; token naming (5 conventions) + placement (4 tiers) + dead constant re-declarations on provider; z-scale coupling blocks per-component CSS; React 19 ref-as-prop migration contained (7 forwardRef sites); RadioGroup context value unmemoized; missing `"./package.json"` export.

---

## What's done well (keep; several are rare)

Native inputs for check/radio/switch (right call, fewest defects); WebKit touch-capture lesson on Button with regression test; switch post-drag click swallower (extract & reuse for toast I3); phase-scoped `will-change` everywhere; keyframes travel with backdrop-filter OFF; literal keyframe values (iOS var() bug); coarse-pointer degradations (scrim blur off, cheaper glass, drier morphs); toast stacking pure CSS no measurement; layer-aware Escape peeling; trigger ARIA consistency; tooltip focus-visible gating + touch refusal; toast timers pause on hover/blur; scrollbar compensation; portal theming nearest-carrier fix; `verify` pipeline + type-level a11y contracts (`iconOnly requires aria-label`); zero `any`; self-healing phase machines with race tests; scrub watchdogs.

---

## Recommended fix phases

1. **Phase A — Package integrity (small, unblocks everything):** unbundle + directives + react-server smoke + system-dark tokens + `files` narrowing. (~P0 #1-3, arch I7/I9 partial)
2. **Phase B — iOS gestures:** touch-action + canScrollUp + pointer-capture side + listener leak + switch userSelect. (P0 #4-5, #20 + I5-side)
3. **Phase C — A11y blockers:** ContextMenu keyboard, toast keyboard+inert exemption, focus trap filter, focus rings (outline strategy + forced-colors), focus-restore condition, muted-text palette pass, parseColor hardening. (P0 #8-17)
4. **Phase D — Motion calm-by-default:** dead stagger fix, calm preset + motion tokens + provider API + presets export, reduced-motion specificity pass, scrub promotion + blur-off-while-dragging, VT timeout. (P0 #18-19 + P1 motion/perf)
5. **Phase E — Architecture hygiene:** @layer, overlay consolidation, controlled Select/ContextMenu, rootClassName, verify expansion, changesets/CI, visualViewport hook (P0 #6 — needs design), browser-floor decision (P0 #7).

Each phase = its own plan (superpowers flow), independently shippable, `pnpm verify` green.
