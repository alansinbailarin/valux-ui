import { copyFile, cp, mkdir } from "node:fs/promises";

await mkdir("dist/styles", { recursive: true });
await copyFile("src/styles.css", "dist/styles.css");
await cp("src/styles", "dist/styles", { recursive: true });
