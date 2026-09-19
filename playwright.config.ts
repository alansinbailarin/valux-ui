import { defineConfig, devices } from "@playwright/test";

// Matches the project convention documented in next.config.ts: the dev
// server (backed by its own .next-dev dist dir, set via NEXT_DIST_DIR in
// the "dev" script) runs on 3005 so it can sit alongside the phone-testing
// prod build on 3006 without corrupting either's build cache.
const PORT = 3005;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: `pnpm dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    // Next.js dev cold start plus the e2e suite's own health checks can be
    // slow in CI; give it plenty of room instead of flaking on first run.
    timeout: 180_000,
  },
});
