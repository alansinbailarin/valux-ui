import { appendFile } from "node:fs/promises";

// TEMPORARY: receives on-device errors from phones (no devtools there).
export async function POST(request: Request) {
  const body = await request.text();
  const line = `[${new Date().toISOString()}] ${body}\n`;
  console.log("[debug-mobile]", body);
  await appendFile("debug-mobile.log", line).catch(() => {});
  return new Response("ok");
}
