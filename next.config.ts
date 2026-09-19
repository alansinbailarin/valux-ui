import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev (3005) and the phone-testing prod build (3006) run side by side;
  // sharing .next meant every `next build` corrupted the live dev server
  // (Internal Server Error until a restart). Dev gets its own dist dir.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: {
    // Turbopack's dev server ACCUMULATES module graphs across recompiles to
    // serve HMR; a long editing session (hundreds of file rewrites) walked
    // the heap to ~8GB and V8 OOM-killed the process. This target makes
    // Turbopack shed its caches under pressure instead of ballooning.
    // 4GB: high enough to never throttle a normal session.
    turbopackMemoryLimit: 4 * 1024 * 1024 * 1024,
  },
};

export default nextConfig;
