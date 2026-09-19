import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-dev/**", ".next-dev/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx,mts,mjs}"],
    rules: {
      "max-lines": [
        "error",
        { max: 120, skipBlankLines: true, skipComments: true },
      ],
      // _-prefixed = deliberately stripped in a destructure (e.g. className).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "max-lines": [
        "error",
        { max: 180, skipBlankLines: true, skipComments: true },
      ],
    },
  },
]);

export default eslintConfig;
