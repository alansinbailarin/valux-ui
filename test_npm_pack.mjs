import { execFileSync } from "node:child_process";
const output = execFileSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8" });
console.log(JSON.parse(output));
