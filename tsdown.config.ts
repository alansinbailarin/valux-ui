import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    // Separate entry: it imports next/navigation (OPTIONAL peer), which
    // must never load from the main barrel for non-Next consumers.
    transitions: "src/transitions/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  platform: "neutral",
  target: "es2020",
  // Keep each source module as its own output file instead of merging
  // everything into one bundle. Rolldown's module-merge otherwise drops
  // per-module directives like "use client" (they're only meaningful at
  // the top of a module), which breaks RSC for every consumer. See
  // scripts/verify-conditions.mjs.
  unbundle: true,
  deps: {
    // next/* is an optional peer (only the view-transition system uses
    // it); everything under its scope must stay external too.
    neverBundle: ["react", "react-dom", "react/jsx-runtime", "next", /^next\//],
  },
});
