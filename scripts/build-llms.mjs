// Assembles llms-full.txt — the complete, LLM-consumable documentation —
// from the ordered markdown sources. Run: pnpm docs:llms
import { readFile, writeFile } from "node:fs/promises";

const SOURCES = [
  "docs/getting-started.md",
  "docs/components/provider.md",
  "docs/components/cursor.md",
  "docs/components/mode-orb.md",
  "docs/components/button.md",
  "docs/components/card.md",
  "docs/components/menu.md",
  "docs/components/popover.md",
  "docs/components/tooltip.md",
  "docs/components/dialog.md",
  "docs/components/sheet.md",
  "docs/components/drawer.md",
  "docs/components/toast.md",
  "docs/components/input.md",
  "docs/components/switch.md",
  "docs/components/checkbox.md",
  "docs/components/select.md",
  "docs/components/context-menu.md",
  "docs/components/view-transitions.md",
  "docs/motion.md",
];

const HEADER = `# Valux UI — full documentation (llms-full.txt)

Valux UI provides accessible React components for modern Next.js
applications with a native-mobile feel: Button, Card, Menu, Popover, Tooltip, Dialog, Sheet, Toast, Input, TextArea, Switch, Checkbox, Radio, Select, ContextMenu, Drawer, and the Hero view-transition system,
sharing one theme, ONE pronounced radius, and one motion signature. Zero
runtime dependencies; plain CSS ("@valux/ui/styles.css") and TypeScript
types. Install: \`pnpm add @valux/ui\`. Requires React 18/19.

Everything below is generated from docs/ — edit those sources, then run
\`pnpm docs:llms\`.

---
`;

const parts = await Promise.all(SOURCES.map((path) => readFile(path, "utf8")));
const body = parts.join("\n---\n\n");
await writeFile("llms-full.txt", `${HEADER}\n${body}`);
console.log(`llms-full.txt written (${body.length + HEADER.length} chars) from ${SOURCES.length} sources`);
