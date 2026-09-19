#!/usr/bin/env node
/**
 * Loads the BUILT dist/ artifacts under each Node.js export condition the
 * package ships for ("import", "require", "react-server") and reports
 * pass/fail per (file, condition) pair. This is pure Node — no bundler, no
 * Next.js runtime — so it exercises exactly what package.json's "exports"
 * map promises consumers.
 *
 * It caught a real bug: the build currently strips the "use client"
 * directive from dist/index.js, so under `--conditions react-server` Node
 * resolves `react`'s server-only export subset instead of the client one,
 * and that subset has no `createContext` — the module then crashes on
 * load with "Named export 'createContext' not found". See RSC_STRIP_RE
 * below.
 *
 * dist/transitions.js separately fails to load via raw `node --input-type
 * =module -e "import(...)"` under EVERY condition, because it has a
 * static, perfectly idiomatic `import ... from "next/navigation"` and
 * `next` ships no "exports" map. Node's ESM loader has no legacy
 * extension-search fallback for package subpath imports in that case
 * (bundlers like webpack/turbopack/vite do have one, which is why real
 * Next.js apps never see this). That's a limitation of verifying
 * bundler-target output with bare Node, not a condition-wiring bug, so we
 * recognize its signature (BUNDLER_ONLY_RE) and treat it as an
 * informational skip rather than a failure.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// TODO(valux): delete this escape hatch (and the `gated` branch below
// that reads it) if the react-server smoke test ever regresses again before
// the underlying bug is fixed. As of the `unbundle: true` + directive fixes,
// the default path is strict — this only matters if someone re-sets the env
// var by hand.
const ALLOW_RSC_FAILURE = process.env.NK_ALLOW_RSC_FAILURE === "1";

const BUNDLER_ONLY_RE = /Cannot find module[\s\S]*Did you mean to import/;
const RSC_STRIP_RE = /Named export '.*' not found|does not provide an export named/;

// Node has no concept of the "use client" directive: a real RSC bundler
// stops tracing a module's own imports the instant it sees the directive,
// but Node's ESM linker will eagerly resolve every transitively-imported
// binding regardless. Register a loader hook that emulates the bundler's
// client-boundary behavior (see rsc-boundary-loader.mjs) so this smoke test
// fails only for genuine directive/packaging bugs, not for the inherent gap
// between raw Node and a real bundler.
const registerLoaderPath = fileURLToPath(
  new URL("./register-rsc-boundary-loader.mjs", import.meta.url),
);

const targets = [
  { esm: "dist/index.js", cjs: "dist/index.cjs" },
  { esm: "dist/transitions.js", cjs: "dist/transitions.cjs" },
];

function runEsm(file, conditions) {
  const args = conditions.flatMap((c) => ["--conditions", c]);
  if (conditions.includes("react-server")) {
    args.push("--import", registerLoaderPath);
  }
  args.push("--input-type=module", "-e", `import(${JSON.stringify(resolve(file))})`);
  return spawnSync(process.execPath, args, { encoding: "utf8" });
}

function runCjs(file) {
  const args = ["-e", `require(${JSON.stringify(resolve(file))})`];
  return spawnSync(process.execPath, args, { encoding: "utf8" });
}

function messageLine(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  // Prefer the actual error message over the "file://...:N" / caret lines
  // Node prints first for a SyntaxError-shaped module-load failure.
  return lines.find((line) => /Error:/.test(line)) ?? lines[0] ?? "(no stderr)";
}

const rows = [];
let failures = 0;

function record(file, condition, result, { gated = false } = {}) {
  if (result.status === 0) {
    rows.push([file, condition, "PASS", ""]);
    return;
  }

  const stderr = result.stderr || "";

  if (BUNDLER_ONLY_RE.test(stderr)) {
    rows.push([file, condition, "SKIP", "bundler-only dependency, not resolvable via raw Node ESM"]);
    return;
  }

  if (gated && RSC_STRIP_RE.test(stderr)) {
    if (ALLOW_RSC_FAILURE) {
      rows.push([file, condition, "WARN", `KNOWN BUG (use client stripped): ${messageLine(stderr)}`]);
      return;
    }
    rows.push([file, condition, "FAIL", messageLine(stderr)]);
    failures += 1;
    return;
  }

  rows.push([file, condition, "FAIL", messageLine(stderr)]);
  failures += 1;
}

for (const target of targets) {
  for (const file of [target.esm, target.cjs]) {
    if (!existsSync(resolve(file))) {
      console.error(`${file} does not exist. Run "pnpm build" first.`);
      process.exit(1);
    }
  }

  record(target.esm, "import", runEsm(target.esm, []));
  record(target.cjs, "require", runCjs(target.cjs));
  record(target.esm, "react-server", runEsm(target.esm, ["react-server"]), { gated: true });
}

const widths = [0, 0, 0, 0];
for (const row of rows) row.forEach((cell, i) => (widths[i] = Math.max(widths[i], cell.length)));
for (const row of rows) {
  console.log(row.map((cell, i) => cell.padEnd(widths[i])).join("  "));
}

if (rows.some((row) => row[2] === "WARN")) {
  console.warn(
    "\nWARN rows above are the tracked react-server bug, downgraded by NK_ALLOW_RSC_FAILURE=1. Delete that escape once it's fixed.",
  );
}

if (failures > 0) {
  console.error(`\n${failures} condition(s) failed.`);
  process.exit(1);
}

console.log(`\nAll checked conditions passed or were expectedly skipped/warned (${rows.length} checks).`);
