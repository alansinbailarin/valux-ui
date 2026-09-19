import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const runtimeExports = ["Button", "Card", "ValuxProvider"];
const publicTypes = [
  "ButtonProps",
  "ButtonAsAnchorProps",
  "ButtonAsButtonProps",
  "ButtonColor",
  "ButtonVariant",
  "CardProps",
  "CardVariant",
  "CardMediaProps",
  "CardTitleProps",
  "ValuxColorTheme",
  "ValuxDensity",
  "ValuxMode",
  "ValuxProviderProps",
  "ValuxTheme",
];
const styleEntry = "dist/styles.css";

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Package contract failed: ${message}`);
  }
}

function getPackedFiles() {
  const output = execFileSync("pnpm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
  });
  const packResult = JSON.parse(output);

  assert(Array.isArray(packResult.files), "pnpm pack returned no file list");
  return new Set(packResult.files.map(({ path }) => path));
}

function getCssImports(css) {
  return [...css.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]\)?\s*;/g)].map(
    ([, path]) => posix.normalize(posix.join(dirname(styleEntry), path)),
  );
}

const packedFiles = getPackedFiles();
for (const packedFile of packedFiles) {
  assert(
    !/\.test\.[cm]?[jt]sx?$/.test(packedFile),
    `${packedFile} must not be published`,
  );
}
const moduleUrl = `${pathToFileURL(resolve("dist/index.js")).href}?contract`;
const publicModule = await import(moduleUrl);

for (const name of runtimeExports) {
  assert(name in publicModule, `dist/index.js does not export ${name}`);
}

const declarations = await Promise.all(
  ["dist/index.d.ts", "dist/index.d.cts"].map((file) => readFile(file, "utf8")),
);
for (const name of publicTypes) {
  assert(
    declarations.every((declaration) =>
      new RegExp(`\\b${name}\\b`).test(declaration),
    ),
    `declaration outputs do not contain ${name}`,
  );
}

assert(packedFiles.has(styleEntry), `${styleEntry} is missing from the package`);
const css = await readFile(styleEntry, "utf8");
for (const importedFile of getCssImports(css)) {
  assert(
    packedFiles.has(importedFile),
    `${importedFile}, imported by ${styleEntry}, is missing from the package`,
  );
}

console.log("Package contract verified.");
