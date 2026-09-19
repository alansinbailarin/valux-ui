"use client";

import { ModeOrb, Cursor } from "@/src";
import type { Specimen } from "./specimenTypes";

export const SYSTEM_SPECIMENS: Specimen[] = [
  {
    id: "modeorb",
    label: "ModeOrb",
    description: "Interactive theme toggle that paints the screen with an expanding circular wave transition to switch color schemes",
    height: 180,
    node: (
      <ModeOrb style={{ position: "relative", right: "auto", bottom: "auto" }} />
    ),
    controls: [
      { kind: "flag", prop: "visible", initial: true }
    ],
    render: (v) => {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '2rem 0' }}>
          {v.visible ? <ModeOrb style={{ position: "relative", right: "auto", bottom: "auto" }} /> : <span style={{ opacity: 0.5 }}>Orb hidden</span>}
        </div>
      );
    },
    renderSnippet: () => {
      const code = `import { ModeOrb } from "@valux/ui";

export function App() {
  return (
    <>
      {/* Positioned fixed bottom-right by default */}
      <ModeOrb />
      <main>...</main>
    </>
  );
}
`;
      return [{ tok: "plain", text: code }];
    }
  },
  {
    id: "cursor",
    label: "Cursor",
    description: "Smooth-following custom cursor that intelligently morphs its shape and size when hovering over interactive elements",
    height: 180,
    node: <Cursor inert />,
    controls: [
      { kind: "flag", prop: "inert", initial: false }
    ],
    render: (v) => {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '2rem 0' }}>
          <Cursor inert={Boolean(v.inert)} />
          <p style={{ opacity: 0.5 }}>Move your mouse over the canvas!</p>
        </div>
      );
    },
    renderSnippet: (v) => {
      const inertStr = v.inert ? " inert" : "";
      const code = `import { Cursor } from "@valux/ui";

export function App() {
  return (
    <>
      <Cursor${inertStr} />
      <main>...</main>
    </>
  );
}
`;
      return [{ tok: "plain", text: code }];
    }
  },
];
