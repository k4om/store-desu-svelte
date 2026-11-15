import { Elysia, file } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import path from "node:path";
import fs from "node:fs";
import { api } from "./index.ts";

const isBun = typeof Bun !== "undefined";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

// dist/ lives next to src/ (vite outDir is "../dist" from svelte/)
const distDir = path.resolve(import.meta.dirname, "../dist");
const indexHtml = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error(`[production] ${indexHtml} not found. Run "npm run build" first.`);
  process.exit(1);
}

// Bun has a native server; Node needs the @elysiajs/node adapter
const adapter = isBun ? undefined : (await import("@elysiajs/node")).node();

const app = new Elysia({ adapter })
  .use(api)
  .use(
    staticPlugin({
      // the plugin resolves `assets` relative to the current working directory
      assets: path.relative(process.cwd(), distDir) || ".",
      prefix: "/",
    }),
  )
  // SPA fallback: unknown non-API routes get index.html (client-side routing)
  .onError(({ code, request }) => {
    const { pathname } = new URL(request.url);
    if (code === "NOT_FOUND" && !pathname.startsWith("/api")) {
      return file(indexHtml);
    }
  })
  .listen({ port: PORT, hostname: HOST }, () => {
    console.log(
      `[production] ${isBun ? "Bun" : "Node"} server running at http://${HOST}:${PORT}`,
    );
  });

// Graceful shutdown
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    console.log(`[production] ${signal} received, shutting down...`);
    await app.stop();
    process.exit(0);
  });
}