import express from "express";
import path from "node:path";
import fs from "node:fs";
import { api } from "./index.ts";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

// dist/ lives next to src/ (vite outDir is "../dist" from svelte/)
const distDir = path.resolve(import.meta.dirname, "../dist");
const indexHtml = path.join(distDir, "index.html");

if (!fs.existsSync(indexHtml)) {
  console.error(`[production] ${indexHtml} not found. Run "npm run build" first.`);
  process.exit(1);
}

const app = express();

// API first, so /api/* never reaches the static handler or the SPA fallback.
app.use("/api", api);

// Static assets from the Vite build.
app.use(express.static(distDir));

// SPA fallback: unknown non-API GET routes get index.html (client-side routing).
app.get("/{*splat}", (_req, res) => {
  res.sendFile(indexHtml);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[production] Node server running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`[production] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    // Don't hang forever on keep-alive connections.
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}